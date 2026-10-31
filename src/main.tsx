import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/nunito';
import './index.css';
import { App } from './app/App';
import { createAppServices } from './services/createAppServices';

const root = createRoot(document.getElementById('root')!);

createAppServices().then(
  (services) =>
    root.render(
      <StrictMode>
        <App services={services} />
      </StrictMode>,
    ),
  (error: unknown) => {
    console.error(error);
    root.render(
      <p style={{ padding: 24, fontFamily: 'system-ui', color: '#1f2650' }}>Little Worlds couldn’t start. Please refresh the page.</p>,
    );
  },
);
