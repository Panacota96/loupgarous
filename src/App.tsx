import { useGameStore } from './store/gameStore';
import SetupScreen from './components/Setup/SetupScreen';
import GameBoard from './components/Game/GameBoard';
import buyMeACoffeeBadge from './assets/buy-me-a-coffee-badge.svg';
import './styles/global.css';

const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/santiagogow';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <>
      {phase === 'setup' ? <SetupScreen /> : <GameBoard />}
      <a
        className="buy-me-a-coffee-badge"
        href={BUY_ME_A_COFFEE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Support this project on Buy Me a Coffee"
      >
        <img src={buyMeACoffeeBadge} alt="Buy Me a Coffee" />
      </a>
    </>
  );
}
