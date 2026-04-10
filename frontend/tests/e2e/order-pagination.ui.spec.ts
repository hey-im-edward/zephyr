import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

type MockAuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
};

type MockOrder = {
  id: number;
  orderCode: string;
  customerName: string;
  email: string;
  status: 'PENDING';
  paymentMethod: 'COD';
  shippingMethodName: string;
  promotionCode: null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  deliveryWindow: string;
  createdAt: string;
};

type MockOrderList = {
  items: MockOrder[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

const ACCOUNT_PAGE_SIZE = 8;
const ADMIN_PAGE_SIZE = 20;
const TOTAL_ORDERS = 21;

function createMockOrders(prefix: string, total: number): MockOrder[] {
  return Array.from({ length: total }, (_, index) => {
    const orderNumber = String(total - index).padStart(3, '0');
    return {
      id: 10_000 + total - index,
      orderCode: `${prefix}-${orderNumber}`,
      customerName: `${prefix} Customer`,
      email: `${prefix.toLowerCase()}@zephyr.vn`,
      status: 'PENDING',
      paymentMethod: 'COD',
      shippingMethodName: 'Express',
      promotionCode: null,
      totalAmount: 2_490_000,
      shippingFee: 30_000,
      discountAmount: 0,
      deliveryWindow: '2-4 giờ',
      createdAt: new Date(Date.now() - index * 60_000).toISOString(),
    };
  });
}

function paginateOrders(orders: MockOrder[], page: number, pageSize: number): MockOrderList {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const totalItems = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: orders.slice(start, end),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  };
}

async function routeAuth(page: Page, user: MockAuthUser) {
  const authSession = {
    accessToken: `token-${user.role.toLowerCase()}`,
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user,
  };

  await page.route('**/api/v1/auth/refresh**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authSession),
    });
  });

  await page.route('**/api/v1/auth/me**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });
}

async function routeAccountWorkspace(page: Page, orders: MockOrder[]) {
  await page.route('**/api/v1/account/orders**', async (route) => {
    const url = new URL(route.request().url());
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageSizeParam = Number(url.searchParams.get('pageSize') ?? String(ACCOUNT_PAGE_SIZE));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paginateOrders(orders, pageParam, pageSizeParam)),
    });
  });

  await page.route('**/api/v1/account/addresses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/v1/account/wishlist**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

async function routeAdminWorkspace(page: Page, orders: MockOrder[]) {
  await page.route('**/api/v1/admin/orders**', async (route) => {
    const url = new URL(route.request().url());
    const queryParam = (url.searchParams.get('query') ?? '').trim().toLowerCase();
    const statusParam = (url.searchParams.get('status') ?? '').trim().toUpperCase();

    const filtered = orders.filter((order) => {
      const statusMatch = !statusParam || order.status === statusParam;
      const queryMatch =
        !queryParam ||
        order.orderCode.toLowerCase().includes(queryParam) ||
        order.customerName.toLowerCase().includes(queryParam) ||
        order.email.toLowerCase().includes(queryParam);
      return statusMatch && queryMatch;
    });

    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageSizeParam = Number(url.searchParams.get('pageSize') ?? String(ADMIN_PAGE_SIZE));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paginateOrders(filtered, pageParam, pageSizeParam)),
    });
  });

  await page.route('**/api/v1/admin/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        categoryCount: 0,
        shoeCount: 0,
        userCount: 0,
        orderCount: orders.length,
        pendingOrderCount: orders.length,
        totalRevenue: 0,
      }),
    });
  });

  const emptyArrayEndpoints = [
    '**/api/v1/admin/categories',
    '**/api/v1/admin/shoes',
    '**/api/v1/admin/campaigns',
    '**/api/v1/admin/banner-slots',
    '**/api/v1/admin/collections',
    '**/api/v1/admin/promotions',
    '**/api/v1/admin/shipping-methods',
    '**/api/v1/admin/media-assets',
    '**/api/v1/admin/reviews',
    '**/api/v1/admin/admin-roles',
    '**/api/v1/admin/audit-logs',
  ];

  for (const endpoint of emptyArrayEndpoints) {
    await page.route(endpoint, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  }
}

async function expectPaginationText(page: Page, currentPage: number, totalPages: number, totalItems: number) {
  await expect(page.getByText(new RegExp(`Trang\\s+${currentPage}\\s*/\\s*${totalPages}`))).toBeVisible();
  await expect(page.getByText(new RegExp(`Tổng\\s+${totalItems}\\s+đơn`))).toBeVisible();
}

test('account page supports order pagination UI flow', async ({ page }) => {
  const accountUser: MockAuthUser = {
    id: 101,
    fullName: 'Pagination Account User',
    email: 'account-pagination@zephyr.vn',
    phone: '0900000000',
    role: 'USER',
  };
  const orders = createMockOrders('ACC', TOTAL_ORDERS);

  await routeAuth(page, accountUser);
  await routeAccountWorkspace(page, orders);

  await page.route('**/api/v1/auth/me**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Unauthorized' }),
    });
  });

  await page.goto('/tai-khoan');
  await expect(page.getByText('Lịch sử mua hàng')).toBeVisible();

  await expectPaginationText(page, 1, 3, TOTAL_ORDERS);
  await expect(page.locator('table tbody tr:visible')).toHaveCount(ACCOUNT_PAGE_SIZE);

  const firstPageCode = (await page.locator('table tbody tr:visible').first().locator('td').first().textContent())?.trim();
  expect(firstPageCode).toBe('ACC-021');

  await page.getByRole('button', { name: 'Sau' }).click();

  await expectPaginationText(page, 2, 3, TOTAL_ORDERS);
  await expect(page.locator('table tbody tr:visible')).toHaveCount(ACCOUNT_PAGE_SIZE);

  const secondPageCode = (await page.locator('table tbody tr:visible').first().locator('td').first().textContent())?.trim();
  expect(secondPageCode).toBe('ACC-013');
});

test('admin operations tab supports order pagination UI flow', async ({ page }) => {
  const adminUser: MockAuthUser = {
    id: 201,
    fullName: 'Pagination Admin User',
    email: 'admin-pagination@zephyr.vn',
    phone: '0900000001',
    role: 'ADMIN',
  };
  const orders = createMockOrders('OPS', TOTAL_ORDERS);

  await routeAuth(page, adminUser);
  await routeAdminWorkspace(page, orders);

  await page.goto('/admin');
  await page.getByRole('tab', { name: 'Operations' }).click();

  const adminQueryInput = page.getByPlaceholder('Tìm theo mã đơn, tên khách hoặc email');
  await expect(adminQueryInput).toBeVisible();
  await adminQueryInput.fill('OPS');
  await page.getByRole('button', { name: 'Lọc đơn' }).click();

  await expectPaginationText(page, 1, 2, TOTAL_ORDERS);
  await expect(page.locator('table tbody tr:visible')).toHaveCount(ADMIN_PAGE_SIZE);

  const firstPageCode = (await page.locator('table tbody tr:visible').first().locator('td').first().textContent())?.trim();
  expect(firstPageCode).toBe('OPS-021');

  await page.getByRole('button', { name: 'Sau' }).click();

  await expectPaginationText(page, 2, 2, TOTAL_ORDERS);
  await expect(page.locator('table tbody tr:visible')).toHaveCount(TOTAL_ORDERS - ADMIN_PAGE_SIZE);

  const secondPageCode = (await page.locator('table tbody tr:visible').first().locator('td').first().textContent())?.trim();
  expect(secondPageCode).toBe('OPS-001');
});
