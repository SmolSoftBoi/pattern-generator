import PatternComponent from './components/Pattern';

const initialPatternSeed = 'pattern-generator-initial-preview';

export default function Home() {
  return (
    <main>
      <PatternComponent initialSeed={initialPatternSeed} />
    </main>
  );
}
