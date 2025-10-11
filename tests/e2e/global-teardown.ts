import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
    console.log("🧹 Starting E2E test global teardown...");

    try {
        // Clean up any test data
        console.log("🗑️ Cleaning up test data...");

        // Example: Clean up test wallet
        // await cleanupTestWallet();

        // Clean up any temporary files
        console.log("📁 Cleaning up temporary files...");

        console.log("✅ Global teardown completed successfully");
    } catch (error) {
        console.error("❌ Global teardown failed:", error);
        // Don't throw error in teardown to avoid masking test failures
    }
}

export default globalTeardown;
