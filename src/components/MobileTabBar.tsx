import { useGameStore } from '@/store/gameStore';

interface MobileTabBarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const tabItems = [
  { id: 'home', label: '首页', icon: '◆' },
  { id: 'team', label: '战队', icon: '▦' },
  { id: 'season', label: '赛季', icon: '🏆' },
  { id: 'market', label: '转会', icon: '⇄' },
  { id: 'training', label: '训练', icon: '↑' },
];

export const MobileTabBar = ({ currentPage, onPageChange }: MobileTabBarProps) => {
  const { notifications } = useGameStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-valorant-darker/95 backdrop-blur-md border-t border-valorant-red/20 lg:hidden">
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {tabItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center gap-0.5
                min-h-[48px] min-w-[56px] px-2 py-1
                transition-all duration-200
                ${isActive ? 'text-valorant-red' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-tactical font-semibold tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-valorant-red rounded-b-full" />
              )}
              {item.id === 'home' && notifications.length > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-valorant-red text-white text-[9px] font-bold rounded-full flex items-center justify-center font-display">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
