import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param {...import("clsx").ClassValue} inputs
 * @returns {string} classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * @param {string | undefined} firstName
 * @param {string | undefined} lastName
 * @returns {string} initials
 */
export function getInitials(firstName, lastName) {
  const nameInitial = firstName?.at(0);
  const lastNameInitial = lastName?.at(0);

  if (!nameInitial || !lastNameInitial) {
    return "JD";
  }

  return nameInitial.toUpperCase() + lastNameInitial.toUpperCase();
}
