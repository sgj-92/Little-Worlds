import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/renderApp';

describe('Parent accounts', () => {
  it('sends signed-out visitors to sign in, then back where they were going', async () => {
    const { user, router } = renderApp('/library', { auth: { signedIn: false } });
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sign-in');

    await user.type(screen.getByLabelText('Email'), 'parent@example.com');
    await user.type(screen.getByLabelText('Password'), 'storytime');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('heading', { name: 'My storybooks' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/library');
  });

  it('validates the form and shows sign-in errors calmly', async () => {
    const { user } = renderApp('/sign-in', { auth: { signedIn: false } });
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Please enter your email.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'parent@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/don’t match/);
  });

  it('lets parents reveal the password they typed', async () => {
    const { user } = renderApp('/sign-in', { auth: { signedIn: false } });
    const field = await screen.findByLabelText('Password');
    expect(field).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field).toHaveAttribute('type', 'text');
  });

  it('asks new parents to confirm their email when required', async () => {
    const { user } = renderApp('/sign-up', { auth: { signedIn: false, requireConfirmation: true } });
    await user.type(await screen.findByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'long enough');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('new@example.com')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'One last step' })).toBeInTheDocument();
  });

  it('signs up, sets up the child profile, and lands on a personalised home', async () => {
    const { user, services } = renderApp('/sign-up', { auth: { signedIn: false }, needsOnboarding: true });
    await user.type(await screen.findByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'long enough');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Who’s listening?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /start making stories/i }));
    expect(screen.getByText('Please add a first name or nickname.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('First name or nickname'), 'Leo');
    await user.click(screen.getByRole('radio', { name: '7–8' }));
    await user.click(screen.getByRole('radio', { name: 'Owl' }));
    await user.click(screen.getByRole('button', { name: /start making stories/i }));

    expect(await screen.findByRole('heading', { name: 'Good morning, Leo' })).toBeInTheDocument();
    expect(services.settings.settings.get().child).toEqual({ name: 'Leo', ageBand: '7-8', avatar: 'owl' });
  });

  it('shows social sign-in only for providers that are switched on', async () => {
    renderApp('/sign-in', { auth: { signedIn: false, providers: ['google', 'apple'] } });
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
  });

  it('hides social sign-in when no provider is configured', async () => {
    renderApp('/sign-in', { auth: { signedIn: false } });
    await screen.findByRole('heading', { name: 'Welcome back' });
    expect(screen.queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();
  });

  it('sends a password reset link', async () => {
    const { user } = renderApp('/forgot-password', { auth: { signedIn: false } });
    await user.type(await screen.findByLabelText('Email'), 'parent@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
  });

  it('explains an expired reset link', async () => {
    renderApp('/reset-password', { auth: { signedIn: false } });
    expect(await screen.findByRole('heading', { name: 'This link has expired' })).toBeInTheDocument();
  });

  it('signs out from grown-up settings', async () => {
    const { user, router } = renderApp('/parent', {}, (s) => s.parentGate.unlock());
    expect(await screen.findByText('demo@littleworlds.local')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sign-in');
  });

  it('exports the family’s data as a file', async () => {
    const createObjectURL = vi.fn(() => 'blob:export');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { user } = renderApp('/parent', {}, (s) => s.parentGate.unlock());
    await user.click(await screen.findByRole('button', { name: 'Export data' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});
