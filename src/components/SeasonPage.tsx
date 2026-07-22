import { useGameStore } from '@/store/gameStore';
import type { NewsItem } from '@/types';
import { vctTimeline } from '@/data/tournaments';
import { useSeasonActions } from '@/hooks';
import { VCTCard, VCTButton, Badge } from '@/components/ui';

export const SeasonPage = () => {
  const { playerTeam, advanceWeek, advanceSeason } = useGameStore();

  const {
    currentWeek,
    currentSeason,
    gamePhase,
    vctStandings,
    newsHistory,
    seasonRecords,
    getPhaseLabel,
  } = useSeasonActions();

  const currentVCTStage = vctTimeline.find(t => t.week === currentWeek) || vctTimeline[0];
  const sortedStandings = [...vctStandings].sort((a, b) => b.points - a.points);
  const myRank = sortedStandings.findIndex(s => s.teamId === 'my-team') + 1;

  const getNewsIcon = (type: NewsItem['type']) => {
    const icons: Record<string, string> = {
      transfer: '↔',
      match: '⚔',
      event: '⚡',
      injury: '🏥',
      contract: '📝',
      season: '🏆',
      milestone: '⭐',
    };
    return icons[type] || '•';
  };

  const getNewsBadgeVariant = (type: NewsItem['type']): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      transfer: 'info',
      match: 'primary',
      event: 'warning',
      injury: 'danger',
      contract: 'success',
      season: 'warning',
      milestone: 'default',
    };
    return variants[type] || 'default';
  };

  const getPhaseBadgeVariant = (): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (gamePhase) {
      case 'preseason': return 'info';
      case 'regular': return 'success';
      case 'playoffs': return 'warning';
      case 'offseason': return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部 - 赛季进度 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-valorant-darker via-valorant-dark to-valorant-darker clip-corner border border-valorant-red/20 grid-bg">
        <div className="scan-line"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" size="sm">
                  {gamePhase === 'preseason' ? 'PRE-SEASON' : gamePhase === 'regular' ? 'REGULAR' : gamePhase === 'playoffs' ? 'PLAYOFFS' : 'OFF-SEASON'}
                </Badge>
                <span className="text-xs text-gray-500 font-tactical tracking-wider">
                  WEEK {String(currentWeek).padStart(2, '0')} · VCT {currentSeason}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wider">赛季中心</h1>
              <p className="text-gray-400 mt-1 font-tactical">
                当前阶段: <Badge variant={getPhaseBadgeVariant()} size="sm">{getPhaseLabel}</Badge>
                {currentVCTStage && ` · ${currentVCTStage.name}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <VCTCard variant="dark" corner="br" className="px-4 py-2">
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">VCT RANK</p>
                <p className="font-display text-xl font-bold text-valorant-gold">#{myRank || '-'}</p>
              </VCTCard>
              <VCTCard variant="dark" corner="br" className="px-4 py-2">
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">VCT PTS</p>
                <p className="font-display text-xl font-bold text-valorant-cyan">{playerTeam.vctPoints}</p>
              </VCTCard>
              {gamePhase === 'offseason' ? (
                <VCTButton variant="warning" size="lg" onClick={advanceSeason}>
                  进入新赛季
                </VCTButton>
              ) : (
                <VCTButton variant="primary" size="lg" onClick={advanceWeek}>
                  推进周 →
                </VCTButton>
              )}
            </div>
          </div>

          {/* 赛季进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-tactical mb-1">
              <span>W1</span>
              <span>赛季进度</span>
              <span>W16</span>
            </div>
            <div className="h-2 bg-valorant-dark/60 clip-corner-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-valorant-cyan via-valorant-teal to-valorant-gold transition-all"
                style={{ width: `${Math.min(100, (currentWeek / 16) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VCT积分排名 */}
        <div className="lg:col-span-2">
          <VCTCard variant="default" className="p-5">
            <h2 className="vct-heading font-display text-lg text-white mb-4">VCT积分排名</h2>
            <div className="space-y-1">
              {/* 表头 */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-gray-500 font-tactical tracking-wider border-b border-white/5">
                <span className="col-span-1">#</span>
                <span className="col-span-4">战队</span>
                <span className="col-span-2">赛区</span>
                <span className="col-span-1">胜</span>
                <span className="col-span-1">负</span>
                <span className="col-span-2">积分</span>
                <span className="col-span-1">进度</span>
              </div>
              {sortedStandings.slice(0, 16).map((team, idx) => (
                <div
                  key={team.teamId}
                  className={`grid grid-cols-12 gap-2 px-3 py-2 items-center transition-all ${
                    team.teamId === 'my-team'
                      ? 'bg-valorant-red/10 border border-valorant-red/30 clip-corner-sm'
                      : 'hover:bg-valorant-dark/40'
                  }`}
                >
                  <span className={`col-span-1 font-display font-bold text-sm ${
                    idx < 3 ? 'text-valorant-gold' : idx < 8 ? 'text-valorant-teal' : 'text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="col-span-4 flex items-center gap-2">
                    <div
                      className="w-5 h-5 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-[10px]"
                      style={{ background: team.color }}
                    >
                      {team.teamName.charAt(0)}
                    </div>
                    <span className={`text-xs font-display font-semibold truncate ${
                      team.teamId === 'my-team' ? 'text-valorant-red' : 'text-white'
                    }`}>
                      {team.teamName}
                      {team.teamId === 'my-team' && <Badge variant="warning" size="sm">YOU</Badge>}
                    </span>
                  </div>
                  <span className="col-span-2 text-[10px] text-gray-400 font-tactical">{team.region}</span>
                  <Badge variant="success" size="sm">{team.wins}</Badge>
                  <Badge variant="danger" size="sm">{team.losses}</Badge>
                  <Badge variant="info" size="md">{team.points}</Badge>
                  <div className="col-span-1">
                    <div className="h-1.5 bg-valorant-dark/60 clip-corner-sm overflow-hidden">
                      <div className="h-full bg-valorant-teal" style={{ width: `${Math.min(100, team.points)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </VCTCard>
        </div>

        {/* 右侧 - 新闻 + 赛季历史 */}
        <div className="space-y-4">
          {/* 新闻动态 */}
          <VCTCard variant="default" className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">新闻动态</h3>
            {newsHistory.length === 0 ? (
              <p className="text-gray-500 text-xs font-tactical text-center py-6">暂无新闻</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {newsHistory.slice(0, 15).map(news => (
                  <VCTCard key={news.id} variant="dark" corner="br" className="p-2.5">
                    <div className="flex items-start gap-2">
                      <Badge variant={getNewsBadgeVariant(news.type)} size="sm">
                        {getNewsIcon(news.type)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-semibold text-white">{news.title}</p>
                        <p className="text-[10px] text-gray-400 font-tactical mt-0.5">{news.content}</p>
                        <p className="text-[10px] text-gray-600 font-tactical mt-1">第 {news.week} 周</p>
                      </div>
                    </div>
                  </VCTCard>
                ))}
              </div>
            )}
          </VCTCard>

          {/* 赛季历史 */}
          {seasonRecords.length > 0 && (
            <VCTCard variant="default" className="p-4">
              <h3 className="vct-heading font-display text-base text-white mb-3">历史赛季</h3>
              <div className="space-y-2">
                {seasonRecords.map((record, idx) => (
                  <VCTCard key={idx} variant="dark" corner="br" className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-bold text-white text-sm">VCT {record.season}</span>
                      <Badge variant="warning" size="sm">{record.vctPoints} pts</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-tactical">
                      <Badge variant="success" size="sm">{record.wins}胜</Badge>
                      <Badge variant="danger" size="sm">{record.losses}负</Badge>
                      <span>奖金 ${record.prizeMoney.toLocaleString()}</span>
                    </div>
                  </VCTCard>
                ))}
              </div>
            </VCTCard>
          )}

          {/* 本赛季数据 */}
          <VCTCard variant="default" className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">赛季数据</h3>
            <div className="grid grid-cols-2 gap-2">
              <VCTCard variant="dark" corner="br" className="p-2 text-center">
                <p className="font-display text-lg font-bold text-green-400">{playerTeam.seasonWins}</p>
                <p className="text-[10px] text-gray-500 font-tactical">SEASON WINS</p>
              </VCTCard>
              <VCTCard variant="dark" corner="br" className="p-2 text-center">
                <p className="font-display text-lg font-bold text-red-400">{playerTeam.seasonLosses}</p>
                <p className="text-[10px] text-gray-500 font-tactical">SEASON LOSSES</p>
              </VCTCard>
              <VCTCard variant="dark" corner="br" className="p-2 text-center">
                <p className="font-display text-lg font-bold text-valorant-gold">${playerTeam.seasonPrize.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 font-tactical">PRIZE MONEY</p>
              </VCTCard>
              <VCTCard variant="dark" corner="br" className="p-2 text-center">
                <p className="font-display text-lg font-bold text-valorant-cyan">${playerTeam.weeklyRevenue.toLocaleString()}/w</p>
                <p className="text-[10px] text-gray-500 font-tactical">WEEKLY REV</p>
              </VCTCard>
            </div>
            <VCTCard variant="dark" corner="br" className="p-2 mt-3">
              <div className="flex justify-between text-[10px] font-tactical">
                <span className="text-gray-500">周收入</span>
                <Badge variant="success" size="sm">+${playerTeam.weeklyRevenue.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between text-[10px] font-tactical mt-1">
                <span className="text-gray-500">周支出(薪资)</span>
                <Badge variant="danger" size="sm">-${playerTeam.weeklyExpense.toLocaleString()}</Badge>
              </div>
              <div className="border-t border-white/5 mt-1 pt-1 flex justify-between text-xs font-display font-semibold">
                <span className="text-gray-400">周净收入</span>
                <Badge variant={playerTeam.weeklyRevenue - playerTeam.weeklyExpense >= 0 ? 'success' : 'danger'} size="sm">
                  ${(playerTeam.weeklyRevenue - playerTeam.weeklyExpense).toLocaleString()}
                </Badge>
              </div>
            </VCTCard>
          </VCTCard>
        </div>
      </div>
    </div>
  );
};