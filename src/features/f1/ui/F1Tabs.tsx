import { Link } from 'react-router-dom';
import type { F1Tab } from '../model/f1.types';

const TABS: Array<{ id: F1Tab; label: string }> = [
  { id: 'calendar', label: 'Календарь' },
  { id: 'standings', label: 'Кубок' },
  { id: 'settings', label: 'Настройки' },
];

export const F1Tabs = ({ active }: { active: F1Tab }) => (
  <nav className="f1-tabs" aria-label="Разделы Формулы-1">
    {TABS.map((tab) => (
      <Link
        key={tab.id}
        to={`/f1/${tab.id}`}
        className={tab.id === active ? 'f1-tab f1-tab--active' : 'f1-tab'}
        aria-current={tab.id === active ? 'page' : undefined}
      >
        {tab.label}
      </Link>
    ))}
  </nav>
);
