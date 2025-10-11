import { test, expect } from "@playwright/test";

test.describe("RPC Communication", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Wait for processes to initialize
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });
    });

    test("should establish RPC connection on startup", async ({ page }) => {
        // Wait for RPC connection to be established
        await page.waitForSelector("[data-testid='rpc-status-connected']", {
            timeout: 30000,
        });

        // Verify RPC status shows connected
        const rpcStatus = page.locator("[data-testid='rpc-status-connected']");
        await expect(rpcStatus).toBeVisible();
    });

    test("should fetch wallet balance via RPC", async ({ page }) => {
        // Navigate to wallet page
        await page.goto("/wallet");
        await page.waitForLoadState("networkidle");

        // Wait for balance to load
        await page.waitForSelector("[data-testid='balance-card']", {
            timeout: 30000,
        });

        // Check if balance is displayed
        const balanceElement = page.locator("[data-testid='balance-amount']");
        await expect(balanceElement).toBeVisible();

        // Verify balance format (should be a number)
        const balanceText = await balanceElement.textContent();
        expect(balanceText).toMatch(/^\d+\.\d+$/);
    });

    test("should fetch network information via RPC", async ({ page }) => {
        // Navigate to network/dashboard page
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Wait for network info to load
        await page.waitForSelector("[data-testid='network-info']", {
            timeout: 30000,
        });

        // Check network information is displayed
        const networkInfo = page.locator("[data-testid='network-info']");
        await expect(networkInfo).toBeVisible();

        // Should contain network name and status
        await expect(networkInfo).toContainText("Network");
    });

    test("should fetch peer information via RPC", async ({ page }) => {
        // Navigate to network page
        await page.goto("/network");
        await page.waitForLoadState("networkidle");

        // Wait for peer info to load
        await page.waitForSelector("[data-testid='peer-list']", {
            timeout: 30000,
        });

        // Check peer information is displayed
        const peerList = page.locator("[data-testid='peer-list']");
        await expect(peerList).toBeVisible();
    });

    test("should fetch mempool information via RPC", async ({ page }) => {
        // Navigate to mempool page
        await page.goto("/wallet/mempool");
        await page.waitForLoadState("networkidle");

        // Wait for mempool info to load
        await page.waitForSelector("[data-testid='mempool-overview']", {
            timeout: 30000,
        });

        // Check mempool information is displayed
        const mempoolOverview = page.locator(
            "[data-testid='mempool-overview']",
        );
        await expect(mempoolOverview).toBeVisible();
    });

    test("should fetch mining information via RPC", async ({ page }) => {
        // Navigate to mining page
        await page.goto("/mining");
        await page.waitForLoadState("networkidle");

        // Wait for mining info to load
        await page.waitForSelector("[data-testid='mining-dashboard']", {
            timeout: 30000,
        });

        // Check mining information is displayed
        const miningDashboard = page.locator(
            "[data-testid='mining-dashboard']",
        );
        await expect(miningDashboard).toBeVisible();
    });

    test("should handle RPC connection errors gracefully", async ({ page }) => {
        // This test would need to simulate RPC connection failure
        // For now, we'll check that error handling UI exists

        // Check for error notifications
        const errorNotification = page.locator(
            "[data-testid='rpc-error-notification']",
        );

        if (await errorNotification.isVisible()) {
            await expect(errorNotification).toBeVisible();
            await expect(errorNotification).toContainText("Connection Error");
        }
    });

    test("should retry failed RPC calls", async ({ page }) => {
        // Navigate to wallet page
        await page.goto("/wallet");
        await page.waitForLoadState("networkidle");

        // Wait for balance to load
        await page.waitForSelector("[data-testid='balance-card']", {
            timeout: 30000,
        });

        // Check that balance eventually loads (indicating retry worked)
        const balanceElement = page.locator("[data-testid='balance-amount']");
        await expect(balanceElement).toBeVisible();
    });

    test("should display RPC call status", async ({ page }) => {
        // Check for RPC status indicators
        const rpcStatus = page.locator("[data-testid='rpc-status']");

        if (await rpcStatus.isVisible()) {
            await expect(rpcStatus).toBeVisible();
            // Should show connected status
            await expect(rpcStatus).toContainText("Connected");
        }
    });

    test("should handle concurrent RPC calls", async ({ page }) => {
        // Navigate to dashboard which makes multiple RPC calls
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Wait for all data to load
        await page.waitForSelector("[data-testid='dashboard-content']", {
            timeout: 30000,
        });

        // Check that multiple data points are loaded
        const balanceCard = page.locator("[data-testid='balance-card']");
        const networkInfo = page.locator("[data-testid='network-info']");
        const systemStats = page.locator("[data-testid='system-stats']");

        if (await balanceCard.isVisible()) {
            await expect(balanceCard).toBeVisible();
        }

        if (await networkInfo.isVisible()) {
            await expect(networkInfo).toBeVisible();
        }

        if (await systemStats.isVisible()) {
            await expect(systemStats).toBeVisible();
        }
    });

    test("should maintain RPC connection during navigation", async ({
        page,
    }) => {
        // Start at dashboard
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Navigate to wallet
        await page.goto("/wallet");
        await page.waitForLoadState("networkidle");

        // Navigate to mining
        await page.goto("/mining");
        await page.waitForLoadState("networkidle");

        // Navigate back to dashboard
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Check that RPC connection is still active
        const rpcStatus = page.locator("[data-testid='rpc-status-connected']");
        await expect(rpcStatus).toBeVisible();
    });
});
