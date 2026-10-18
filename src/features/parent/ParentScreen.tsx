import { useState } from 'react';
import { useServices } from '@/services/ServicesContext';
import { ParentGate } from './ParentGate';
import { ParentSettingsScreen } from './ParentSettingsScreen';

export function ParentScreen() {
  const { parentGate } = useServices();
  const [unlocked, setUnlocked] = useState(() => parentGate.isUnlocked());
  if (!unlocked) {
    return (
      <ParentGate
        onUnlock={() => {
          parentGate.unlock();
          setUnlocked(true);
        }}
      />
    );
  }
  return (
    <ParentSettingsScreen
      onLock={() => {
        parentGate.lock();
        setUnlocked(false);
      }}
    />
  );
}
