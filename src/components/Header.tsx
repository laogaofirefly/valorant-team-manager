import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { VCTCard, VCTButton } from '@/components/ui';
import { useTeamActions, useSeasonActions } from '@/hooks';
import { formatCurrency, getPhaseText } from '@/utils/helpers';
import { roleNames } from '@/data/agents';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  username?: string;
  nickname?: string;
  vctPoints?: number;
  offline?: boolean;
}

export const Header = ({ currentPage, onPageChange, username, nickname, offline = false }: HeaderProps) => {
  const {
    notifications,
    clearNotifications
  } = useGameStore();

  const { logout } = useAuthStore();
  
  const { playerTeam, getTeamRating } = useTeamActions();
  const { currentWeek, currentSeason, gamePhase } = useSeasonActions();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { id: 'home', label: '主页', icon: '◆' },
    { id: 'season', label: '赛季', icon: '🏆' },
    { id: 'team', label: '战队', icon: '▦' },
    { id: 'market', label: '转会', icon: '⇄' },
    { id: 'tournaments', label: '赛事', icon: '★' },
    { id: 'training', label: '训练', icon: '↑' },
    { id: 'tactics', label: '战术', icon: '⌖' },
    { id: 'facility', label: '设施', icon: '▣' },
    { id: 'scout', label: '新秀', icon: '⭐' },
    { id: 'achievements', label: '成就', icon: '🏆' },
    { id: 'multiplayer', label: '对战', icon: '⚔' },
    { id: 'leaderboard', label: '榜单', icon: '🏅' },
    { id: 'saves', label: '存档', icon: '💾' },
  ];

  const teamStrength = playerTeam.players.length > 0
    ? playerTeam.players.reduce((sum, p) => sum + p.rating, 0) / playerTeam.players.length
    : 0;

  const chemistry = playerTeam.chemistry;
  const teamRating = getTeamRating;
  const recentNotifications = notifications.slice(-5).reverse();

  const getPhaseColor = () => {
    if (gamePhase === 'preseason') return 'text-valorant-cyan';
    if (gamePhase === 'regular') return 'text-valorant-teal';
    return 'text-valorant-red';
  };

  return (
    <header className="sticky top-0 z-50 bg-valorant-darker/95 backdrop-blur-md border-b border-valorant-red/20">
      {/* 状态栏 - 移动端简化 */}
      <div className="bg-gradient-to-r from-valorant-red/10 via-transparent to-valorant-cyan/5 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-3 py-1 flex items-center justify-between text-xs font-tactical">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-valorant-red rounded-full animate-pulse"></span>
              <span className="text-valorant-red font-bold tracking-wider text-[10px] md:text-xs">VCT LIVE</span>
            </span>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <span className="text-gray-400 text-[10px] md:text-xs">W{String(currentWeek).padStart(2, '0')}</span>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <span className={`${getPhaseColor()} font-semibold uppercase tracking-wider text-[10px] md:text-xs hidden sm:inline`}>
              {getPhaseText(gamePhase)}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-gray-500 text-[10px] hidden sm:inline">S{currentSeason}</span>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <span className="text-gray-400 text-[10px] md:text-xs">
              #<span className="text-valorant-gold font-bold">{playerTeam.ranking}</span>
            </span>
            {username && (
              <>
                <span className="text-gray-600 hidden md:inline">|</span>
                <span className="text-gray-400 text-[10px] hidden md:inline">
                  <span className="text-red-500 font-bold">@{nickname || username}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 py-2 md:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & 战队名 */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-valorant-red to-valorant-red-dark clip-corner flex items-center justify-center">
                <span className="font-display text-xl md:text-2xl font-bold text-white">V</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-valorant-gold clip-corner-sm"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-base md:text-lg font-bold text-white tracking-wider leading-none">
                VALORANT <span className="text-valorant-red">MANAGER</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-tactical tracking-wider mt-0.5">
                {playerTeam.name.toUpperCase()}
              </p>
            </div>
          </div>

          {/* 中央导航 - 桌面端 */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-valorant-panel/50 p-1 clip-corner-sm border border-white/5">
            {navItems.map(item => (
              <VCTButton
                key={item.id}
                variant={currentPage === item.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(item.id)}
                className="px-3 py-2"
              >
                <span className="mr-1 opacity-70">{item.icon}</span>{item.label}
              </VCTButton>
            ))}
          </nav>

          {/* 右侧数据面板 */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* 移动端关键数据 - 预算 */}
            <div className="md:hidden">
              <VCTCard className="px-2 py-1 border-valorant-gold/30" corner="all" variant="highlight">
                <p className="font-display text-sm font-bold text-valorant-gold">
                  ${(playerTeam.budget / 1000).toFixed(0)}K
                </p>
              </VCTCard>
            </div>

            {/* 通知 */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-valorant-panel/50 border border-white/10 clip-corner-sm hover:border-valorant-red transition-colors"
              >
                <span className="text-base">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-valorant-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-display">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <VCTCard className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50" corner="all">
                  <div className="flex items-center justify-between p-3 border-b border-white/5 bg-valorant-red/10">
                    <h3 className="font-display text-sm font-bold text-white tracking-wider">NOTIFICATIONS</h3>
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-400 hover:text-valorant-red font-tactical"
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8 font-tactical">NO NOTIFICATIONS</p>
                    ) : (
                      recentNotifications.map((notification, idx) => (
                        <div key={idx} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className="text-valorant-red mt-0.5">▸</span>
                            <p className="text-sm text-gray-200 flex-1">{notification}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </VCTCard>
              )}
            </div>

            {/* 桌面端数据卡片组 */}
            <div className="hidden md:flex items-center gap-2">
              <VCTCard className="px-3 py-1.5" corner="all">
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">STR</p>
                <p className="font-display text-sm font-bold text-valorant-cyan">{teamStrength.toFixed(1)}</p>
              </VCTCard>
              <VCTCard className="px-3 py-1.5" corner="all">
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">RTG</p>
                <p className="font-display text-sm font-bold text-valorant-gold">{teamRating}</p>
              </VCTCard>
              <VCTCard className="px-3 py-1.5 border-valorant-gold/30" corner="all" variant="highlight">
                <p className="text-[10px] text-valorant-gold/70 font-tactical tracking-wider">BUDGET</p>
                <p className="font-display text-sm font-bold text-valorant-gold">{formatCurrency(playerTeam.budget)}</p>
              </VCTCard>

              {!offline && (
                <VCTButton
                  variant="ghost"
                  size="sm"
                  icon="⏻"
                  onClick={logout}
                  className="hidden lg:inline-flex"
                >
                  登出
                </VCTButton>
              )}
            </div>

            {/* 移动端菜单按钮 - 更多功能 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-9 h-9 flex items-center justify-center bg-valorant-panel/50 border border-white/10 clip-corner-sm hover:border-valorant-red transition-colors text-white"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>

        {/* 移动端更多菜单 */}
        {showMobileMenu && (
          <div className="lg:hidden mt-2 p-2 bg-valorant-panel/90 clip-corner-sm border border-white/10">
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center gap-1 p-2 rounded
                    min-h-[52px] text-[10px] font-tactical
                    transition-all duration-200
                    ${currentPage === item.id 
                      ? 'bg-valorant-red/20 text-valorant-red border border-valorant-red/30' 
                      : 'text-gray-400 hover:bg-white/5'}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            {!offline && (
              <button
                onClick={logout}
                className="w-full py-2 text-sm text-gray-400 hover:text-valorant-red font-tactical border-t border-white/5 pt-2"
              >
                退出登录
              </button>
            )}
          </div>
        )}

        {/* 阵容概览条 - 仅桌面端 */}
        {currentPage !== 'home' && (
          <VCTCard className="hidden lg:flex mt-3 px-3 py-2 items-center gap-3 text-xs flex-wrap" corner="all">
            <span className="text-gray-500 font-tactical tracking-wider">ROSTER:</span>
            {Object.entries({
              Duelist: playerTeam.players.filter(p => p.position === 'Duelist').length,
              Initiator: playerTeam.players.filter(p => p.position === 'Initiator').length,
              Controller: playerTeam.players.filter(p => p.position === 'Controller').length,
              Sentinel: playerTeam.players.filter(p => p.position === 'Sentinel').length,
            }).map(([role, count]) => (
              <span key={role} className="flex items-center gap-1">
                <span className={`${count > 0 ? getRoleColorClass(role) : 'text-gray-700'} font-display font-semibold`}>
                  {roleNames[role as keyof typeof roleNames]}
                </span>
                <span className={`font-tactical ${count > 0 ? 'text-white' : 'text-gray-700'}`}>
                  {count}/2
                </span>
              </span>
            ))}
            <span className="text-gray-700 mx-1">|</span>
            <span className="text-gray-500 font-tactical tracking-wider">TACTIC:</span>
            <span className="text-valorant-cyan font-display font-semibold">{playerTeam.selectedTactic.chineseName}</span>
            <span className="text-gray-700 mx-1">|</span>
            <span className="text-gray-500 font-tactical tracking-wider">CHEM:</span>
            <span className="text-valorant-teal font-display font-semibold">{chemistry.toFixed(0)}</span>
            <span className="text-gray-700 mx-1">|</span>
            <span className="text-gray-500 font-tactical tracking-wider">RECORD:</span>
            <span className="text-green-400 font-display font-semibold">{playerTeam.wins}W</span>
            <span className="text-gray-600">-</span>
            <span className="text-red-400 font-display font-semibold">{playerTeam.losses}L</span>
          </VCTCard>
        )}
      </div>
    </header>
  );
};

const getRoleColorClass = (role: string): string => {
  const colors: Record<string, string> = {
    'Duelist': 'text-valorant-red',
    'Controller': 'text-purple-400',
    'Initiator': 'text-valorant-teal',
    'Sentinel': 'text-valorant-cyan',
  };
  return colors[role] || 'text-gray-400';
};
