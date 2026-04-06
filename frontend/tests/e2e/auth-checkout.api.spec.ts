import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

type AuthResponse = {
  accessToken: string;
};

type ShippingMethod = {
  slug: string;
};

type CatalogResponse = {
  items: Array<{ slug: string }>;
};

type ShoeDetail = {
  sizeStocks: Array<{ sizeLabel: string; available: boolean; stockQuantity: number }>;
};

type Credentials = {
  email: string;
  password: string;
};

type OrderableSelection = {
  shoeSlug: string;
  sizeLabel: string;
};

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

function createCredentials(): Credentials {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    email: `e2e-${suffix}@zephyr.vn`,
    password: 'StrongPass123!',
  };
}

async function registerUser(request: APIRequestContext, credentials: Credentials) {
  const register = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      fullName: 'E2E User',
      email: credentials.email,
      phone: '0900000000',
      password: credentials.password,
    },
  });
  expect(register.ok()).toBeTruthy();
  const registerAuth = (await register.json()) as AuthResponse;
  expect(registerAuth.accessToken).toBeTruthy();
}

async function loginByApi(request: APIRequestContext, credentials: Credentials) {
  const login = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });
  expect(login.ok()).toBeTruthy();
  const auth = (await login.json()) as AuthResponse;
  expect(auth.accessToken).toBeTruthy();
  return auth;
}

async function findFirstOrderableSelection(request: APIRequestContext): Promise<OrderableSelection> {
  const catalogRes = await request.get(`${API_BASE_URL}/catalog?page=1&pageSize=12`);
  expect(catalogRes.ok()).toBeTruthy();
  const catalog = (await catalogRes.json()) as CatalogResponse;
  expect(catalog.items.length).toBeGreaterThan(0);

  for (const item of catalog.items) {
    const shoeRes = await request.get(`${API_BASE_URL}/shoes/${item.slug}`);
    expect(shoeRes.ok()).toBeTruthy();
    const shoe = (await shoeRes.json()) as ShoeDetail;
    const inStockSize = shoe.sizeStocks.find((size) => size.available && size.stockQuantity > 0);
    if (inStockSize) {
      return {
        shoeSlug: item.slug,
        sizeLabel: inStockSize.sizeLabel,
      };
    }
  }

  throw new Error('No in-stock shoe found for e2e checkout flow');
}

test('storefront routes are reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Bộ sưu tập' })).toBeVisible();

  await page.goto('/dang-nhap');
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
});

test('registered user can place an authenticated order', async ({ request }) => {
  const credentials = createCredentials();
  await registerUser(request, credentials);
  const auth = await loginByApi(request, credentials);

  const shippingRes = await request.get(`${API_BASE_URL}/shipping-methods`);
  expect(shippingRes.ok()).toBeTruthy();
  const shippingMethods = (await shippingRes.json()) as ShippingMethod[];
  expect(shippingMethods.length).toBeGreaterThan(0);

  const selected = await findFirstOrderableSelection(request);

  const orderRes = await request.post(`${API_BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
    data: {
      customerName: 'E2E User',
      email: credentials.email,
      phone: '0900000000',
      addressLine: '123 E2E Street',
      city: 'Ho Chi Minh',
      notes: 'Playwright e2e order',
      paymentMethod: 'COD',
      shippingMethodSlug: shippingMethods[0].slug,
      items: [
        {
          shoeSlug: selected.shoeSlug,
          sizeLabel: selected.sizeLabel,
          quantity: 1,
        },
      ],
    },
  });

  expect(orderRes.status()).toBe(201);
  const order = (await orderRes.json()) as { orderCode?: string };
  expect(order.orderCode).toBeTruthy();
});

test('authenticated browser session can complete checkout flow', async ({ page, request }) => {
  const credentials = createCredentials();
  await registerUser(request, credentials);
  const browserLogin = await page.request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });
  expect(browserLogin.ok()).toBeTruthy();
  const selected = await findFirstOrderableSelection(request);

  await page.goto('/');
  await expect(page.getByRole('button', { name: /E2E User/ })).toBeVisible();

  await page.goto(`/shoes/${selected.shoeSlug}`);
  const buyNowButton = page.getByRole('button', { name: 'Mua ngay' });
  await expect(buyNowButton).toBeEnabled();
  await buyNowButton.click();

  await page.waitForURL('**/checkout');
  await page.getByLabel('Tỉnh / Thành phố').fill('Ho Chi Minh');
  await page.getByLabel('Địa chỉ nhận hàng').fill('123 E2E Street');
  const submitOrderButton = page.getByRole('button', { name: 'Xác nhận đặt hàng' });
  await expect(submitOrderButton).toBeEnabled();
  await submitOrderButton.click();

  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem('zephyr-cart');
    return raw === null || raw === '[]';
  });
  await expect(page.getByText('Giỏ hàng đang trống')).toBeVisible({ timeout: 15_000 });
});
