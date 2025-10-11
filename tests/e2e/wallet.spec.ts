import { test, expect } from "@playwright/test";

test.describe("Wallet Functionality", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to wallet page
        await page.goto("/wallet");
        await page.waitForLoadState("networkidle");
    });

    test("should display wallet balance", async ({ page }) => {
        // Wait for balance to load
        await page.waitForSelector("[data-testid='balance-card']");

        // Check if balance is displayed
        const balanceElement = page.locator("[data-testid='balance-amount']");
        await expect(balanceElement).toBeVisible();

        // Verify balance format
        const balanceText = await balanceElement.textContent();
        expect(balanceText).toMatch(/^\d+\.\d+$/);
    });

    test("should display wallet address", async ({ page }) => {
        // Navigate to receive page
        await page.click("[data-testid='receive-tab']");

        // Wait for address to load
        await page.waitForSelector("[data-testid='receive-address']");

        // Check if address is displayed
        const addressElement = page.locator("[data-testid='receive-address']");
        await expect(addressElement).toBeVisible();

        // Verify address format
        const addressText = await addressElement.textContent();
        expect(addressText).toMatch(/^[a-zA-Z0-9]{40,}$/);
    });

    test("should allow copying wallet address", async ({ page }) => {
        // Navigate to receive page
        await page.click("[data-testid='receive-tab']");

        // Wait for address to load
        await page.waitForSelector("[data-testid='receive-address']");

        // Click copy button
        await page.click("[data-testid='copy-address-button']");

        // Check for success toast
        await expect(
            page.locator("[data-testid='toast-success']"),
        ).toBeVisible();
    });

    test("should display transaction history", async ({ page }) => {
        // Navigate to history page
        await page.click("[data-testid='history-tab']");

        // Wait for transactions to load
        await page.waitForSelector("[data-testid='transaction-table']");

        // Check if table is visible
        const tableElement = page.locator("[data-testid='transaction-table']");
        await expect(tableElement).toBeVisible();
    });

    test("should allow sending transactions", async ({ page }) => {
        // Navigate to send page
        await page.click("[data-testid='send-tab']");

        // Wait for send form to load
        await page.waitForSelector("[data-testid='send-form']");

        // Fill in recipient address
        await page.fill(
            "[data-testid='recipient-address']",
            "test-recipient-address",
        );

        // Fill in amount
        await page.fill("[data-testid='amount-input']", "10.0");

        // Click send button
        await page.click("[data-testid='send-button']");

        // Check for confirmation dialog
        await expect(
            page.locator("[data-testid='send-confirmation-dialog']"),
        ).toBeVisible();
    });
});
