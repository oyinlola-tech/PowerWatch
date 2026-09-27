import { ApiError } from "../services/api";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

export const PASSWORD_HINT = "At least 8 characters with upper & lower case letters, a number and a symbol.";

// Mirrors the backend password policy so most mistakes are caught before submitting
const PASSWORD_RULES: [RegExp, string][] = [
  [/^.{8,}$/s, "at least 8 characters"],
  [/[A-Z]/, "an uppercase letter"],
  [/[a-z]/, "a lowercase letter"],
  [/[0-9]/, "a number"],
  [/[^A-Za-z0-9]/, "a symbol"],
];

/** A readable message listing what the password is missing, or undefined if it's fine. */
export const passwordProblem = (password: string): string | undefined => {
  if (!password) return "Enter a password.";
  if (password.length > 128) return "Password must not exceed 128 characters.";
  const missing = PASSWORD_RULES.filter(([rule]) => !rule.test(password)).map(([, label]) => label);
  return missing.length ? `Password needs ${missing.join(", ")}.` : undefined;
};

/** The server's message for API errors, a generic one otherwise. */
export const errorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") =>
  error instanceof ApiError ? error.message : fallback;
