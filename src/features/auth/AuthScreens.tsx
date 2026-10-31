import { MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { validateEmail, validatePassword } from '@/domain/validation';
import { useServices } from '@/services/ServicesContext';
import { useStore } from '@/state/hooks';
import { Button } from '@/ui/Button';
import { StateMessage } from '@/ui/StateMessage';
import { Splash } from '@/ui/Splash';
import { TextField } from '@/ui/TextField';
import { AuthFrame } from './AuthFrame';
import { ProviderButtons } from './ProviderButtons';

const linkClass = 'font-extrabold text-lilac-700 underline-offset-4 hover:underline';

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 font-bold text-rose-700">
      {message}
    </p>
  );
}

export function SignInScreen() {
  const { auth } = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next = { email: validateEmail(email), password: password ? null : 'Please enter your password.' };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;
    setBusy(true);
    const result = await auth.signIn(email.trim(), password);
    setBusy(false);
    if (!result.ok) return setFormError(result.message);
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from !== '/sign-in' ? from : '/', { replace: true });
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to your family’s storybooks."
      footer={
        <>
          New to Little Worlds?{' '}
          <Link to="/sign-up" className={linkClass}>
            Create an account
          </Link>
        </>
      }
    >
      <ProviderButtons onError={setFormError} />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email ?? null} />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password ?? null} />
        <Link to="/forgot-password" className={`${linkClass} -mt-1 self-end text-sm`}>
          Forgot password?
        </Link>
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthFrame>
  );
}

export function SignUpScreen() {
  const { auth } = useServices();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;
    setBusy(true);
    const result = await auth.signUp(email.trim(), password);
    setBusy(false);
    if (!result.ok) return setFormError(result.message);
    if (result.needsConfirmation) return setSentTo(email.trim());
    navigate('/setup', { replace: true });
  }

  if (sentTo) {
    return (
      <AuthFrame title="Check your email">
        <StateMessage
          tone="success"
          className="py-0"
          art={<MailCheck aria-hidden className="size-12" />}
          title="One last step"
          body={
            <p>
              We’ve sent a link to <strong className="text-navy-900">{sentTo}</strong>. Open it on this device to finish setting up your account.
            </p>
          }
          actions={
            <Link to="/sign-in" className={`${linkClass} text-center`}>
              Back to sign in
            </Link>
          }
        />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Create your family account"
      subtitle="Accounts are for grown-ups. Your child never needs to sign in."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/sign-in" className={linkClass}>
            Sign in
          </Link>
        </>
      }
    >
      <ProviderButtons onError={setFormError} />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email ?? null} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password ?? null}
          hint="At least 8 characters."
        />
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-sm text-navy-500">We only use your email to sign you in and help you recover your account.</p>
      </form>
    </AuthFrame>
  );
}

export function ForgotPasswordScreen() {
  const { auth } = useServices();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateEmail(email);
    setError(problem);
    setFormError(null);
    if (problem) return;
    setBusy(true);
    const result = await auth.sendPasswordReset(email.trim());
    setBusy(false);
    if (!result.ok) return setFormError(result.message);
    setSent(true);
  }

  return (
    <AuthFrame
      title="Reset your password"
      subtitle={sent ? undefined : 'We’ll email you a link to choose a new one.'}
      footer={
        <Link to="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <StateMessage
          tone="success"
          className="py-0"
          art={<MailCheck aria-hidden className="size-12" />}
          title="Check your email"
          body="If there’s an account for that address, a reset link is on its way."
        />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormError message={formError} />
          <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" size="lg" fullWidth disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthFrame>
  );
}

/** Opened from the password-reset email; the link signs the parent in for this step. */
export function ResetPasswordScreen() {
  const { auth } = useServices();
  const state = useStore(auth.state);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (state.status === 'loading') return <Splash label="Checking your link…" />;
  if (state.status === 'signed-out') {
    return (
      <AuthFrame title="This link has expired">
        <StateMessage
          tone="error"
          className="py-0"
          art={<MailCheck aria-hidden className="size-12" />}
          title="Let’s send a fresh one"
          body="Reset links work once and only for a short time."
          actions={
            <Link to="/forgot-password" className={`${linkClass} text-center`}>
              Send a new link
            </Link>
          }
        />
      </AuthFrame>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validatePassword(password);
    setError(problem);
    setFormError(null);
    if (problem) return;
    setBusy(true);
    const result = await auth.updatePassword(password);
    setBusy(false);
    if (!result.ok) return setFormError(result.message);
    navigate('/', { replace: true });
  }

  return (
    <AuthFrame title="Choose a new password">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <TextField label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} hint="At least 8 characters." />
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? 'Saving…' : 'Save password'}
        </Button>
      </form>
    </AuthFrame>
  );
}
