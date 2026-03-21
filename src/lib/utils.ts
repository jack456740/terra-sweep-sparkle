import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditionally merges Tailwind CSS classes, combining the functionality 
 * of `clsx` (for conditional classes) and `twMerge` (to resolve conflicts).
 *
 * @param inputs - Rest parameters containing class values.
 * @returns A single string of merged, non-conflicting tailwind class names.
 */
export function cn(...inputs: ClassValue[]): string {
  // Defensive validation: ensure inputs is not null/undefined and contains values
  if (!inputs || inputs.length === 0) {
    return "";
  }

  try {
    // Generate the class name string using clsx
    const classNames = clsx(inputs);

    // Merge tailwind utility classes to remove conflicts safely
    return twMerge(classNames);
  } catch (error) {
    // Graceful fallback to avoid throwing unhandled exceptions to the UI layer
    console.warn("Failed to merge tailwind classes in cn() utility function", error);
    return "";
  }
}
