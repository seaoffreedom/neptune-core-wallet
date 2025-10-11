import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
    console.log("🚀 Starting E2E test global setup...");

    // Launch browser for setup
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Wait for the application to be ready
        console.log("⏳ Waiting for application to start...");
        await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

        // Wait for the splash screen to complete
        console.log("⏳ Waiting for splash screen to complete...");
        await page.waitForSelector("[data-testid='main-app']", {
            timeout: 60000,
        });

        // Perform any necessary setup (e.g., login, data seeding)
        console.log("🔧 Performing test setup...");

        // Example: Set up test wallet if needed
        // await setupTestWallet(page);

        console.log("✅ Global setup completed successfully");
    } catch (error) {
        console.error("❌ Global setup failed:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

export default globalSetup;
