import { expect, test } from "@playwright/test";

const GUEST_CART_STORAGE_KEY = "zephyr-cart:guest";

const cartSeed = [
  {
    shoeSlug: "demo-shoe",
    shoeName: "Demo Shoe",
    brand: "ZEPHYR",
    price: 1990000,
    primaryImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    sizeLabel: "41",
    quantity: 1,
  },
];

test("checkout blocks submit when shipping and promotion contracts are unavailable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    ({ items, storageKey }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    },
    { items: cartSeed, storageKey: GUEST_CART_STORAGE_KEY },
  );

  await page.route("**/api/v1/shipping-methods", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "shipping unavailable" }),
    });
  });

  await page.route("**/api/v1/promotions", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "promotion unavailable" }),
    });
  });

  await page.goto("/checkout");

  await expect(
    page.locator("form").getByText("Không thể tải shipping method và promotion từ hệ thống."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạm khóa xác nhận đơn" })).toBeDisabled();
});
