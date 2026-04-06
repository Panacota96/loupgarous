import { useGameStore } from './store/gameStore';
import SetupScreen from './components/Setup/SetupScreen';
import GameBoard from './components/Game/GameBoard';
import './styles/global.css';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  return phase === 'setup' ? <SetupScreen /> : <GameBoard />;
}
