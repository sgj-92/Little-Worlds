export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(email: string): string | null {
  const e = email.trim();
  if (!e) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'That doesn’t look like an email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Please enter a password.';
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  return null;
}

export function validateChildName(name: string): string | null {
  const n = name.trim();
  if (!n) return 'Please add a first name or nickname.';
  if (n.length > 24) return 'Please keep it to 24 characters.';
  return null;
}
