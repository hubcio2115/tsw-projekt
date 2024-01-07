import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param {...import("tailwind-merge").ClassNameValue} inputs
 * @returns {string} classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
