import { Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { validateChildName } from '@/domain/validation';
import type { AgeBand, AvatarId } from '@/domain/types';
import { useServices } from '@/services/ServicesContext';
import { Avatar } from '@/ui/Avatar';
import { AvatarPicker } from '@/ui/AvatarPicker';
import { Button } from '@/ui/Button';
import { ChoiceTiles } from '@/ui/ChoiceTiles';
import { TextField } from '@/ui/TextField';

const AGE_BANDS: AgeBand[] = ['3-4', '5-6', '7-8', '9-10'];

/** First-run setup: the only child details we keep are a first name, age range and picture. */
export function OnboardingScreen() {
  const { settings, auth } = useServices();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('5-6');
  const [avatar, setAvatar] = useState<AvatarId>('fox');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateChildName(name);
    setError(problem);
    setFormError(null);
    if (problem) return;
    setBusy(true);
    const result = await settings.completeOnboarding({ name: name.trim(), ageBand, avatar });
    setBusy(false);
    if (!result.ok) return setFormError(result.message);
    navigate('/', { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-12">
      <div className="flex flex-col items-center text-center">
        <Avatar id={avatar} size="lg" className="animate-pop-in" />
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Who’s listening?</h1>
        <p className="mt-1.5 text-navy-500">Stories will be made just for them. You can change this any time.</p>
      </div>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-7 rounded-5xl bg-white/85 p-5 shadow-soft ring-1 ring-navy-900/5 md:p-7">
        {formError && (
          <p role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 font-bold text-rose-700">
            {formError}
          </p>
        )}
        <TextField
          label="First name or nickname"
          value={name}
          maxLength={24}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          error={error}
          hint="We never need a surname or birthday."
        />
        <ChoiceTiles legend="Age" size="md" columns={4} value={ageBand} onChange={setAgeBand} choices={AGE_BANDS.map((a) => ({ value: a, label: a.replace('-', '–') }))} />
        <AvatarPicker value={avatar} onChange={setAvatar} large />
        <Button type="submit" size="xl" fullWidth disabled={busy} icon={<Sparkles aria-hidden className="size-6" />}>
          {busy ? 'Getting ready…' : 'Start making stories'}
        </Button>
      </form>
      <button type="button" onClick={() => void auth.signOut()} className="mt-6 min-h-12 self-center font-bold text-navy-500 hover:text-navy-900">
        Not your account? Sign out
      </button>
    </div>
  );
}
