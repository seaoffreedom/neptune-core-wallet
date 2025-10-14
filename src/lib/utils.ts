import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Truncates an address for display purposes
 * Shows first 20 and last 20 characters with ellipsis in the middle
 * @param address - The full address to truncate
 * @returns Truncated address string
 */
export function truncateAddress(address: string): string {
    if (address.length <= 50) return address;
    return `${address.substring(0, 20)}...${address.substring(address.length - 20)}`;
}
