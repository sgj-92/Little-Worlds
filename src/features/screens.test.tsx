import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/renderApp';

describe('Home', () => {
  it('greets the child and shows the create action and recent stories', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Good morning, Maya' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Make a new story' })).toHaveAttribute('href', '/create');
    expect(screen.getByRole('heading', { name: 'Keep listening' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });
});

describe('Create → Generating → Player', () => {
  it('creates a story from a picture starter and plays it', async () => {
    const { user, router } = renderApp('/create');
    const make = await screen.findByRole('button', { name: /make my story/i });
    expect(make).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /ocean/i }));
    expect(screen.getByLabelText('Your idea')).toHaveValue('A gentle whale who sings to the fish under the sea');
    await user.click(screen.getByRole('radio', { name: /long/i }));
    await user.click(make);

    expect(router.state.location.pathname).toMatch(/^\/making\//);
    expect(screen.getByRole('heading', { name: 'Making your story' })).toBeInTheDocument();
    expect(screen.getByText(/simulated generation/i)).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: /play my story/i }, { timeout: 4000 }));
    expect(router.state.location.pathname).toMatch(/^\/story\//);
    expect(screen.getByRole('heading', { name: /whale and the song of the sea/i })).toBeInTheDocument();
    expect(screen.getByText('Part 1 of 8')).toBeInTheDocument();
  });

  it('uses the (mock) voice capture and labels the transcription as a sample', async () => {
    const { user } = renderApp('/create');
    await user.click(await screen.findByRole('button', { name: /tap and tell me your idea/i }));
    await user.click(screen.getByRole('button', { name: /stop and use my idea/i }));
    expect(((await screen.findByLabelText('Your idea')) as HTMLTextAreaElement).value).toMatch(/dragon/);
    expect(screen.getAllByTestId('prototype-note').some((n) => /sample transcription/i.test(n.textContent ?? ''))).toBe(true);
  });

  it('gently redirects ideas a parent has ruled out', async () => {
    const { user, router } = renderApp('/create');
    await user.click(await screen.findByRole('button', { name: /type it instead/i }));
    await user.type(screen.getByLabelText('Your idea'), 'A scary monster in the house');
    await user.click(screen.getByRole('button', { name: /make my story/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/pick a different idea/i);
    expect(router.state.location.pathname).toBe('/create');
  });

  it('shows a friendly limit state when no stories are left today', async () => {
    renderApp('/create', {}, (services) => {
      services.settings.update((s) => ({ ...s, limits: { ...s.limits, storiesPerDay: 1 } }));
      services.generator.start({ prompt: 'A fox in the woods', durationMinutes: 5, illustrated: false });
    });
    expect(await screen.findByRole('heading', { name: /all the new stories for today/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /make my story/i })).not.toBeInTheDocument();
  });

  it('recovers from a failed step with Try again', async () => {
    const { user, services } = renderApp('/create');
    services.settings.update((s) => ({ ...s, prototype: { simulateFailure: 'illustrating' } }));
    await user.click(await screen.findByRole('button', { name: /dragon/i }));
    await user.click(screen.getByRole('button', { name: /make my story/i }));
    expect(await screen.findByRole('heading', { name: /let’s try that again/i }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText(/the story are saved/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('button', { name: /play my story/i }, { timeout: 4000 })).toBeInTheDocument();
  });
});

describe('Library', () => {
  it('filters storybooks by listening state', async () => {
    const { user } = renderApp('/library');
    const list = await screen.findByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    await user.click(screen.getByRole('radio', { name: /finished/i }));
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows an empty state when there are no stories', async () => {
    const { services } = renderApp('/library');
    services.stories.clear();
    expect(await screen.findByRole('heading', { name: /bookshelf is empty/i })).toBeInTheDocument();
  });
});

describe('Player', () => {
  it('plays, navigates parts and saves progress', async () => {
    const { user, services } = renderApp('/story/sample_dragon');
    expect(await screen.findByText('Part 1 of 6')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next part' }));
    expect(screen.getByText('Part 2 of 6')).toBeInTheDocument();
    await waitFor(() => expect(services.stories.get('sample_dragon')!.listening.positionSec).toBeGreaterThan(0));
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('handles a missing story', async () => {
    renderApp('/story/nope');
    expect(await screen.findByRole('heading', { name: /storybook is missing/i })).toBeInTheDocument();
  });
});

describe('Parent settings', () => {
  it('requires the grown-up check, then saves settings', async () => {
    const { user, services } = renderApp('/parent');
    await screen.findByText(/× \d+ = \?/);
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/not quite/i);

    const q2 = screen.getByText(/× \d+ = \?/).textContent!;
    const [c, d] = q2.match(/\d+/g)!.map(Number);
    for (const digit of String(c! * d!)) await user.click(screen.getByRole('button', { name: digit }));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));

    const name = await screen.findByLabelText('First name or nickname');
    await user.clear(name);
    await user.type(name, 'Leo');
    expect(services.settings.settings.get().child.name).toBe('Leo');

    await user.click(screen.getByRole('switch', { name: /allow illustrations/i }));
    expect(services.settings.settings.get().limits.allowIllustrations).toBe(false);
    await user.click(screen.getByRole('button', { name: /increase new stories per day/i }));
    expect(services.settings.settings.get().limits.storiesPerDay).toBe(4);
  });

  it('confirms before deleting every storybook', async () => {
    const { user, services } = renderApp('/parent', {}, (sv) => sv.parentGate.unlock());
    await user.click(await screen.findByRole('button', { name: /delete all storybooks/i }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: /keep them/i, hidden: true }));
    expect(services.stories.stories.get()).toHaveLength(6);

    await user.click(screen.getByRole('button', { name: /delete all storybooks/i }));
    await user.click(within(dialog).getByRole('button', { name: /delete everything/i, hidden: true }));
    expect(services.stories.stories.get()).toHaveLength(0);
    expect(await screen.findByText('All storybooks deleted')).toBeInTheDocument();
  });
});
