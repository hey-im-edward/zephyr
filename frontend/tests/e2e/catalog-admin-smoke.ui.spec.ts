import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

type MockAuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
};

const adminUser: MockAuthUser = {
  id: 991,
  fullName: 'Catalog Admin Smoke',
  email: 'catalog-admin-smoke@zephyr.vn',
  phone: '0900000123',
  role: 'ADMIN',
};

const adminCategories = [
  {
    id: 1,
    name: 'Running',
    slug: 'running',
    description: 'Performance running shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    productCount: 1,
  },
  {
    id: 2,
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Daily lifestyle footwear',
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
    productCount: 0,
  },
];

const adminOrders = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  },
};

async function routeAdminWorkspace(page: Page) {
  const authSession = {
    accessToken: 'token-admin',
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: adminUser,
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
      body: JSON.stringify({ user: adminUser }),
    });
  });

  await page.route('**/api/v1/admin/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        categoryCount: adminCategories.length,
        shoeCount: 0,
        userCount: 10,
        orderCount: 0,
        pendingOrderCount: 0,
        totalRevenue: 0,
      }),
    });
  });

  await page.route('**/api/v1/admin/shoes', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/v1/admin/categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(adminCategories),
    });
  });

  await page.route('**/api/v1/admin/orders**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(adminOrders),
    });
  });

  const emptyArrayEndpoints = [
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

test('catalog route remains stable without next-image host runtime crash', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  const response = await page.goto('/catalog');
  expect(response?.ok()).toBeTruthy();

  const fallbackTitle = page.getByText('Catalog tạm gián đoạn');
  const filterRailHeading = page.getByText('Bộ lọc điều hướng');

  if (await fallbackTitle.count()) {
    await expect(fallbackTitle).toBeVisible();
  } else {
    await expect(filterRailHeading).toBeVisible();
  }

  expect(pageErrors.join('\n')).not.toMatch(/next\/image|hostname .* not configured/i);
});

test('admin product category dropdown opens and renders non-black listbox', async ({ page }) => {
  await routeAdminWorkspace(page);

  await page.goto('/admin');
  await page.getByRole('tab', { name: 'Catalog' }).click();
  await page.getByRole('button', { name: 'Thêm sản phẩm' }).first().click();

  const categoryTrigger = page.getByTestId('shoe-category-select-trigger');
  await expect(categoryTrigger).toBeVisible();
  await categoryTrigger.click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', { name: 'Running' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Lifestyle' })).toBeVisible();

  const backgroundColor = await listbox.evaluate((node) => window.getComputedStyle(node).backgroundColor);
  expect(backgroundColor).not.toBe('rgb(0, 0, 0)');
});
