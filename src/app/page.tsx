import { randomUUID } from 'crypto';

import PatternComponent from './components/Pattern';

export default function Home() {
  const initialSeed = randomUUID();

  return (
    <main>
      <PatternComponent initialSeed={initialSeed} />
    </main>
  );
}
