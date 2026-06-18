import { Compass, Map, Heart, Trophy, User } from 'lucide-react';
import type { Section } from './types';

const tabs: { id: Section; label: string; icon: typeof Map }[] = [
  { id: 'descubrir', label: 'Descubrir', icon: Compass },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'mapa', label: 'Mapa', icon: Map },
  { id: 'retos', label: 'Retos', icon: Trophy },
  { id: 'perfil', label: 'Perfil', icon: User },
];

type Props = {
  active: Section;
  onNavigate: (s: Section) => void;
  hidden?: boolean;
};

export default function BottomNav({ active, onNavigate, hidden }: Props) {
  return (
    <nav
      aria-label="Navegación principal"
      className={`absolute inset-x-0 bottom-0 z-[1060] border-t border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => onNavigate(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'fill-primary/15' : ''}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-primary" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
