import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names and resolves Tailwind CSS conflicts.
 * @param {...any} inputs - Class names, expressions, or conditionals
 * @returns {string} - Merged class name string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
