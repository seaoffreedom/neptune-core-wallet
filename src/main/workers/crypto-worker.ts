/**
 * Crypto Worker Thread
 *
 * Handles CPU-intensive cryptographic operations in a separate thread
 * to prevent blocking the main process.
 */

import { parentPort, workerData } from "worker_threads";
import { createHash, randomBytes } from "crypto";

interface WorkerMessage {
    id: string;
    type: "hash" | "random" | "validate";
    data: any;
}

interface WorkerResponse {
    id: string;
    success: boolean;
    result?: any;
    error?: string;
}

// Handle messages from main thread
parentPort?.on("message", async (message: WorkerMessage) => {
    try {
        let result: any;

        switch (message.type) {
            case "hash":
                result = await handleHashOperation(message.data);
                break;
            case "random":
                result = await handleRandomOperation(message.data);
                break;
            case "validate":
                result = await handleValidationOperation(message.data);
                break;
            default:
                throw new Error(`Unknown operation type: ${message.type}`);
        }

        const response: WorkerResponse = {
            id: message.id,
            success: true,
            result,
        };

        parentPort?.postMessage(response);
    } catch (error) {
        const response: WorkerResponse = {
            id: message.id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };

        parentPort?.postMessage(response);
    }
});

async function handleHashOperation(data: {
    input: string;
    algorithm?: string;
}): Promise<string> {
    const { input, algorithm = "sha256" } = data;

    // Simulate CPU-intensive hashing
    const hash = createHash(algorithm);
    hash.update(input);

    // Add some computational work to demonstrate worker benefits
    for (let i = 0; i < 10000; i++) {
        hash.update(i.toString());
    }

    return hash.digest("hex");
}

async function handleRandomOperation(data: {
    length: number;
}): Promise<string> {
    const { length = 32 } = data;
    return randomBytes(length).toString("hex");
}

async function handleValidationOperation(data: {
    input: string;
    pattern: string;
}): Promise<boolean> {
    const { input, pattern } = data;
    const regex = new RegExp(pattern);

    // Simulate CPU-intensive validation
    let result = false;
    for (let i = 0; i < 1000; i++) {
        result = regex.test(input + i.toString());
    }

    return result;
}

// Signal that worker is ready
parentPort?.postMessage({ type: "ready" });
