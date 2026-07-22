import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MobileTabBar } from '@/components/MobileTabBar';
import { HomePage } from '@/components/HomePage';
import { TeamPage } from '@/components/TeamPage';
import { MarketPage } from '@/components/MarketPage';
import { TournamentsPage } from '@/components/TournamentsPage';
import { TrainingPage } from '@/components/TrainingPage';
import { TacticsPage } from '@/components/TacticsPage';
import { FacilityPage } from '@/components/FacilityPage';
import { ScoutPage } from '@/components/ScoutPage';
import { SeasonPage } from '@/components/SeasonPage';
import { AuthPage } from '@/components/AuthPage';
import { LeaderboardPage } from '@/components/LeaderboardPage';
import { MultiplayerPage } from '@/components/MultiplayerPage';
import { SavesPage } from '@/components/SavesPage';
import { AchievementsPage } from '@/components/AchievementsPage';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { StoryModal } from '@/components/StoryModal';
import { MatchOverlay } from '@/components/MatchOverlay';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { VCTCard, VCTButton } from '@/components/ui';

// 检测是否离线模式（GitHub Pages等静态托管环境）
const isOfflineMode = () => {
  const hostname = window.location.hostname;
  return hostname.includes('github.io') ||
         hostname.includes('localhost') === false && hostname.includes('127.0.0.1') === false;
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [offline, setOffline] = useState(false);
  const { isAuthenticated, verify, user } = useAuthStore();
  const { tutorial, resetTutorial, startTutorial } = useGameStore();

  useEffect(() => {
    // 检测离线模式
    if (isOfflineMode()) {
      setOffline(true);
      // 离线模式：自动以访客身份登录
      localStorage.setItem('vct_offline_user', JSON.stringify({
        id: 'offline-user',
        username: '访客',
        nickname: '访客玩家',
        vctPoints: 0,
      }));
      return;
    }

    // 在线模式：验证token
    const token = localStorage.getItem('vct_token');
    if (token) {
      verify();
    }
  }, [verify]);

  // 未登录且不是离线模式时显示认证页面
  if (!isAuthenticated && !offline) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'season':
        return <SeasonPage />;
      case 'team':
        return <TeamPage />;
      case 'market':
        return <MarketPage />;
      case 'tournaments':
        return <TournamentsPage />;
      case 'training':
        return <TrainingPage />;
      case 'tactics':
        return <TacticsPage />;
      case 'facility':
        return <FacilityPage />;
      case 'scout':
        return <ScoutPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'leaderboard':
        return offline
          ? <OfflinePlaceholder title="排行榜" desc="离线模式暂不支持排行榜功能" />
          : <LeaderboardPage />;
      case 'multiplayer':
        return offline
          ? <OfflinePlaceholder title="联机对战" desc="离线模式暂不支持联机对战" />
          : <MultiplayerPage />;
      case 'saves':
        return offline
          ? <OfflinePlaceholder title="云端存档" desc="离线模式使用浏览器本地存储" />
          : <SavesPage />;
      case 'settings':
        return (
          <div className="space-y-6 animate-fade-in">
            <VCTCard variant="highlight" corner="all" className="p-6">
              <h1 className="font-display text-2xl font-bold text-white mb-6">设置</h1>
              
              <div className="space-y-4">
                <VCTCard variant="dark" className="p-4">
                  <h3 className="font-display text-lg font-bold text-white mb-2">新手教程</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {tutorial.completed ? '教程已完成' : `教程进度：第 ${tutorial.currentStep + 1} 步`}
                  </p>
                  <div className="flex gap-2">
                    <VCTButton variant="primary" onClick={startTutorial}>
                      重新开始教程
                    </VCTButton>
                    <VCTButton variant="secondary" onClick={resetTutorial}>
                      重置教程进度
                    </VCTButton>
                  </div>
                </VCTCard>

                <VCTCard variant="dark" className="p-4">
                  <h3 className="font-display text-lg font-bold text-white mb-2">关于游戏</h3>
                  <p className="text-sm text-gray-400">
                    VALORANT战队经理人 - VCT电竞经理模拟游戏
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    版本 1.0.0
                  </p>
                </VCTCard>
              </div>
            </VCTCard>
          </div>
        );
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  // 访客用户信息
  const displayUser = offline
    ? { username: '访客', nickname: '访客玩家', vctPoints: 0 }
    : user;

  return (
    <div className="min-h-screen bg-valorant-dark">
      {offline && (
        <div className="bg-yellow-900/30 border-b border-yellow-700/50 text-yellow-300 text-center py-1 text-xs">
          🎮 离线模式 - 游戏数据保存在本地浏览器中
        </div>
      )}
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        username={displayUser?.username}
        nickname={displayUser?.nickname}
        vctPoints={displayUser?.vctPoints || 0}
        offline={offline}
      />
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 pb-20 lg:pb-6">
        {renderPage()}
      </main>
      
      {/* 移动端底部导航 */}
      <MobileTabBar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      {/* 桌面端页脚 */}
      <footer className="hidden lg:block bg-gray-900 border-t border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            无畏契约战队经理人 · 欢迎 <span className="text-red-500 font-bold">{displayUser?.nickname || displayUser?.username}</span>
            {offline ? ' · 离线模式' : ` · VCT积分 ${displayUser?.vctPoints || 0}`}
          </p>
        </div>
      </footer>

      <TutorialOverlay currentPage={currentPage} />
      <StoryModal />
      <MatchOverlay />
    </div>
  );
}

// 离线模式占位组件
function OfflinePlaceholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="text-6xl mb-4">📴</div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p>{desc}</p>
      <p className="text-sm mt-4 text-gray-500">如需完整功能，请在本地运行前后端服务</p>
    </div>
  );
}

export default App;
