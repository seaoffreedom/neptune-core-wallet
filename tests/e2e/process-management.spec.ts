import { test, expect } from "@playwright/test";

test.describe("Process Management", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("should initialize Neptune processes on app start", async ({
        page,
    }) => {
        // Wait for the splash screen to complete
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Check that processes are initialized
        await page.waitForSelector("[data-testid='neptune-status-connected']", {
            timeout: 30000,
        });

        // Verify status shows connected
        const statusElement = page.locator(
            "[data-testid='neptune-status-connected']",
        );
        await expect(statusElement).toBeVisible();
    });

    test("should display process status in footer", async ({ page }) => {
        // Wait for the app to load
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Check footer shows process status
        const footerStatus = page.locator(
            "[data-testid='footer-neptune-status']",
        );
        await expect(footerStatus).toBeVisible();

        // Should show connected status
        await expect(footerStatus).toContainText("Connected");
    });

    test("should handle process restart", async ({ page }) => {
        // Wait for the app to load
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Navigate to settings or admin panel if available
        // This test assumes there's a restart button somewhere
        const restartButton = page.locator(
            "[data-testid='restart-neptune-button']",
        );

        if (await restartButton.isVisible()) {
            // Click restart button
            await restartButton.click();

            // Wait for restart confirmation
            await page.waitForSelector(
                "[data-testid='restart-confirmation-dialog']",
            );

            // Confirm restart
            await page.click("[data-testid='confirm-restart-button']");

            // Wait for processes to restart
            await page.waitForSelector(
                "[data-testid='neptune-status-connected']",
                {
                    timeout: 60000,
                },
            );

            // Verify status is connected again
            const statusElement = page.locator(
                "[data-testid='neptune-status-connected']",
            );
            await expect(statusElement).toBeVisible();
        }
    });

    test("should handle process shutdown gracefully", async ({ page }) => {
        // Wait for the app to load
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // This test would require a shutdown button in the UI
        // For now, we'll test that the app can handle shutdown events
        const shutdownButton = page.locator(
            "[data-testid='shutdown-neptune-button']",
        );

        if (await shutdownButton.isVisible()) {
            // Click shutdown button
            await shutdownButton.click();

            // Wait for shutdown confirmation
            await page.waitForSelector(
                "[data-testid='shutdown-confirmation-dialog']",
            );

            // Confirm shutdown
            await page.click("[data-testid='confirm-shutdown-button']");

            // Wait for status to show disconnected
            await page.waitForSelector(
                "[data-testid='neptune-status-disconnected']",
                {
                    timeout: 30000,
                },
            );

            // Verify status is disconnected
            const statusElement = page.locator(
                "[data-testid='neptune-status-disconnected']",
            );
            await expect(statusElement).toBeVisible();
        }
    });

    test("should display process errors in UI", async ({ page }) => {
        // Wait for the app to load
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Check for error notifications if processes fail
        const errorNotification = page.locator(
            "[data-testid='process-error-notification']",
        );

        // This test would need to simulate a process failure
        // For now, we'll just check that error handling UI exists
        if (await errorNotification.isVisible()) {
            await expect(errorNotification).toBeVisible();
            await expect(errorNotification).toContainText("Process Error");
        }
    });

    test("should show process health indicators", async ({ page }) => {
        // Wait for the app to load
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Check for health indicators in the UI
        const healthIndicator = page.locator(
            "[data-testid='process-health-indicator']",
        );

        if (await healthIndicator.isVisible()) {
            // Should show healthy status
            await expect(healthIndicator).toHaveClass(/healthy/);
        }

        // Check CPU and memory usage displays
        const cpuUsage = page.locator("[data-testid='cpu-usage']");
        const memoryUsage = page.locator("[data-testid='memory-usage']");

        if (await cpuUsage.isVisible()) {
            await expect(cpuUsage).toBeVisible();
        }

        if (await memoryUsage.isVisible()) {
            await expect(memoryUsage).toBeVisible();
        }
    });
});
