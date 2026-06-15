export const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/**
 * Validates a username against the defined regex pattern.
 *
 * @param username - The username to validate.
 * @returns `true` if the username is valid, `false` otherwise.
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
