export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(s: string): boolean {
  return EMAIL_RE.test(s.trim());
}

const required = (s: string) => s.trim().length > 0;

function emailError(email: string): string | undefined {
  if (!required(email)) return 'Email is required';
  if (!isEmail(email)) return 'Enter a valid email';
  return undefined;
}

function compact<K extends string>(errors: FieldErrors<K>): FieldErrors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined)) as FieldErrors<K>;
}

export function validateLogin(v: { email: string; password: string }): FieldErrors<'email' | 'password'> {
  return compact({
    email: emailError(v.email),
    password: required(v.password) ? undefined : 'Password is required',
  });
}

export function validateSignup(v: {
  email: string;
  password: string;
  confirm: string;
}): FieldErrors<'email' | 'password' | 'confirm'> {
  return compact({
    email: emailError(v.email),
    password: !required(v.password)
      ? 'Password is required'
      : v.password.length < 8
        ? 'Password must be at least 8 characters'
        : undefined,
    confirm: v.password !== v.confirm ? 'Passwords do not match' : undefined,
  });
}

export function validateFeedback(v: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): FieldErrors<'name' | 'email' | 'subject' | 'message'> {
  return compact({
    name: required(v.name) ? undefined : 'Name is required',
    email: emailError(v.email),
    subject: required(v.subject) ? undefined : 'Subject is required',
    message: required(v.message) ? undefined : 'Message is required',
  });
}
