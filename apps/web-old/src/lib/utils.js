import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param {...import("tailwind-merge").ClassNameValue} inputs
 * @returns {string} classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * @param {string} name
 * @returns {string} username
 */
export function getHandleFromUsername(name) {
  const username = name.split(" ").at(2);

  if (!username) return "@username";

  // Username has a form of "(username)" we need to get rid of "(" and ")"
  return "@" + username.substring(1, username.length - 1);
}

/**
 * @param {string | null |undefined} name
 * @returns {string} initials
 */
export function getInitialsFromUsername(name) {
  const splittedUsername = name?.split(" ");

  const firstname = splittedUsername?.at(0);
  const surname = splittedUsername?.at(1);

  const nameInitial = firstname?.at(0);
  const surnameInitial = surname?.at(0);

  if (nameInitial && surnameInitial) {
    return nameInitial.toUpperCase() + surnameInitial.toUpperCase();
  }

  return "JD";
}

/**
 * @param {string} name
 * @returns {string} firstname
 */
export function getNameFromUsername(name) {
  const firstname = name.split(" ").at(0);

  if (firstname) return firstname;
  return "John";
}

/**
 * @param {string} name
 * @returns {string} firstname
 */
export function getSurnameNameFromUsername(name) {
  const firstname = name.split(" ").at(1);

  if (firstname) return firstname;
  return "John";
}
