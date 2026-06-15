export const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
