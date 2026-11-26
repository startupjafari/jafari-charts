import { Gallery } from './scenes/Gallery';

const scenes: Record<string, () => React.ReactElement> = {
  gallery: Gallery,
};

export function App() {
  const scene = new URLSearchParams(location.search).get('scene') ?? 'gallery';
  const Scene = scenes[scene] ?? Gallery;
  return <Scene />;
}
