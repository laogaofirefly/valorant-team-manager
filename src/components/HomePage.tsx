import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { VCTCard, VCTButton, StatCard, Badge } from '@/components/ui';
import { useSeasonActions, useTeamActions, useAchievementActions, useChallengeActions } from '@/hooks';
import { getMatchResultColor, getMatchResultText } from '@/utils/helpers';
import { vctTimeline } from '@/data/tournaments';
import { images } from '@/data/images';
import { Player } from '@/types';

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const { playerTeam, vctStandings } = useGameStore();
  const {
    currentWeek,
    currentSeason,
    gamePhase,
    matchHistory,
    getRecentMatches,
    getRecentNews,
  } = useSeasonActions();
  const { getTeamRating, getRosterValue } = useTeamActions();
  const { recentUnlocked, progress } = useAchievementActions();
  const { weeklyChallenges, unclaimed, claimChallenge } = useChallengeActions();
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  const totalFacilityLevel = playerTeam.facilities.reduce((sum, f) => sum + f.level, 0);
  const maxFacilityLevel = playerTeam.facilities.length * 5;
  const winRate = playerTeam.wins + playerTeam.losses > 0
    ? Math.round(playerTeam.wins / (playerTeam.wins + playerTeam.losses) * 100)
    : 0;

  const sortedStandings = [...vctStandings].sort((a, b) => b.points - a.points);
  const myRank = sortedStandings.findIndex(s => s.teamId === 'my-team') + 1;

  const currentVCTStage = vctTimeline.find(t => t.week === currentWeek) || vctTimeline[0];
  const nextVCTStage = vctTimeline.find(t => t.week > currentWeek) || vctTimeline[vctTimeline.length - 1];

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-valorant-gold';
    if (rating >= 80) return 'text-valorant-teal';
    if (rating >= 70) return 'text-valorant-cyan';
    return 'text-gray-400';
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Duelist': 'from-valorant-red to-valorant-red-dark',
      'Controller': 'from-purple-500 to-purple-700',
      'Initiator': 'from-valorant-teal to-emerald-600',
      'Sentinel': 'from-valorant-cyan to-blue-600',
    };
    return colors[position] || 'from-gray-500 to-gray-700';
  };

  const displayPlayers = showAllPlayers 
    ? playerTeam.players 
    : playerTeam.players.slice(0, 4);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Hero区 - 战队概览 */}
      <VCTCard className="grid-bg" variant="highlight" corner="all">
        <div className="relative p-4 md:p-6 overflow-hidden">
          {/* Hero 背景图 - 半透明叠加在深色背景上 */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
            style={{ backgroundImage: `url(${images.homeHeroBackground})`, backgroundColor: '#0f1115' }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            {/* 战队信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">
                  {gamePhase === 'preseason' ? '季前赛' : gamePhase === 'regular' ? '常规赛' : gamePhase === 'playoffs' ? '季后赛' : '休赛期'}
                </Badge>
                <span className="text-xs text-gray-500 font-tactical tracking-wider">
                  第 {currentWeek} 周 · S{currentSeason}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-white tracking-wider leading-tight">
                {playerTeam.name.toUpperCase()}
              </h1>
              <p className="text-gray-400 mt-1 font-tactical text-sm">
                {currentVCTStage?.name || 'VCT赛季'}
              </p>

              {/* 核心数据 - 移动端横向滚动 */}
              <div className="flex gap-4 mt-4 overflow-x-auto -mx-1 px-1 pb-1">
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider">排名</p>
                  <p className="font-display text-xl md:text-2xl font-bold text-valorant-gold">#{myRank || '-'}</p>
                </div>
                <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block"></div>
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider">积分</p>
                  <p className="font-display text-xl md:text-2xl font-bold text-valorant-cyan">{playerTeam.vctPoints}</p>
                </div>
                <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block"></div>
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider">评级</p>
                  <p className={`font-display text-xl md:text-2xl font-bold ${getRatingColor(getTeamRating)}`}>
                    {getTeamRating}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block"></div>
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-tactical tracking-wider">战绩</p>
                  <p className="font-display text-xl md:text-2xl font-bold">
                    <span className="text-green-400">{playerTeam.wins}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-red-400">{playerTeam.losses}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 战队Logo */}
            <div className="hidden md:block relative">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-valorant-red/30 to-valorant-red-dark/10 clip-corner flex items-center justify-center border border-valorant-red/40 overflow-hidden">
                {/* 战队Logo 背景图 */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
                  style={{ backgroundImage: `url(${images.teamLogoBackground})`, backgroundColor: '#1a0d0d' }}
                  aria-hidden="true"
                />
                <span className="relative font-display text-5xl md:text-6xl font-bold text-white">
                  {playerTeam.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge variant="gold">#{playerTeam.ranking}</Badge>
              </div>
            </div>
          </div>
        </div>
      </VCTCard>

      {/* 快速操作区 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { page: 'tactics' as const, icon: '⌖', title: '战术', desc: playerTeam.selectedTactic.chineseName, color: 'red' },
          { page: 'training' as const, icon: '↑', title: '训练', desc: '提升属性', color: 'green' },
          { page: 'market' as const, icon: '⇄', title: '转会', desc: '签约选手', color: 'blue' },
          { page: 'facility' as const, icon: '▣', title: '设施', desc: `LV ${totalFacilityLevel}/${maxFacilityLevel}`, color: 'purple' },
        ].map((item) => (
          <VCTCard
            key={item.page}
            className="p-3 md:p-4 cursor-pointer group"
            variant={item.color === 'red' ? 'highlight' : 'default'}
            corner="all"
            onClick={() => onNavigate?.(item.page)}
          >
            <div className="text-valorant-red text-2xl mb-1">{item.icon}</div>
            <p className="font-display font-bold text-white text-sm tracking-wider">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-tactical truncate">{item.desc}</p>
          </VCTCard>
        ))}
      </div>

      {/* 关键数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard
          title="战队评级"
          value={getTeamRating}
          icon="★"
          color="yellow"
          subtitle="整体实力"
        />
        <StatCard
          title="阵容价值"
          value={`${(getRosterValue / 1000).toFixed(0)}K`}
          icon="$"
          color="green"
          subtitle="市场价值"
        />
        <StatCard
          title="VCT积分"
          value={playerTeam.vctPoints}
          icon="◆"
          color="blue"
          subtitle="赛季累计"
        />
        <StatCard
          title="胜率"
          value={`${winRate}%`}
          icon="%"
          color="red"
          subtitle={`${playerTeam.wins}胜 ${playerTeam.losses}负`}
        />
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 战队阵容 */}
        <VCTCard className="lg:col-span-2" corner="all">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">战队阵容</h2>
            <VCTButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('team')}
              className="min-h-[32px] py-1 text-xs"
            >
              管理 →
            </VCTButton>
          </div>
          <div className="p-3 md:p-4">
            {playerTeam.players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-2">战队尚未组建</p>
                <VCTButton
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate?.('market')}
                >
                  进入转会市场
                </VCTButton>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {displayPlayers.map((player: Player) => (
                    <VCTCard key={player.id} className="p-2 md:p-3" corner="all">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 clip-corner-sm flex items-center justify-center font-display text-lg md:text-xl font-bold text-white bg-gradient-to-br ${getPositionColor(player.position)}`}>
                            {player.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-valorant-darker text-valorant-gold text-[9px] font-display font-bold border border-valorant-gold/30">
                            {player.rating}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-display font-bold text-white text-sm truncate">
                              {player.chineseName}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-tactical">
                            {getRoleName(player.position)} · {player.nationality}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-tactical">
                            <span className="text-gray-500">枪法 <span className="text-white font-bold">{player.attributes.aim}</span></span>
                            <span className="text-gray-500">意识 <span className="text-white font-bold">{player.attributes.gameSense}</span></span>
                          </div>
                        </div>
                      </div>
                    </VCTCard>
                  ))}
                </div>
                {playerTeam.players.length > 4 && (
                  <button
                    onClick={() => setShowAllPlayers(!showAllPlayers)}
                    className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-valorant-cyan font-tactical transition-colors"
                  >
                    {showAllPlayers ? '收起 ▲' : `查看全部 ${playerTeam.players.length} 名选手 ▼`}
                  </button>
                )}
              </>
            )}
          </div>
        </VCTCard>

        {/* 近期战绩 */}
        <VCTCard corner="all">
          <div className="p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">近期战绩</h2>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <VCTCard className="p-2 md:p-3 text-center" corner="all">
                <p className="font-display text-xl md:text-2xl font-bold text-green-400">{playerTeam.wins}</p>
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">胜</p>
              </VCTCard>
              <VCTCard className="p-2 md:p-3 text-center" corner="all">
                <p className="font-display text-xl md:text-2xl font-bold text-red-400">{playerTeam.losses}</p>
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">负</p>
              </VCTCard>
              <VCTCard className="p-2 md:p-3 text-center" corner="all">
                <p className="font-display text-xl md:text-2xl font-bold text-valorant-gold">{winRate}%</p>
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">胜率</p>
              </VCTCard>
            </div>

            <p className="text-xs text-gray-500 font-tactical tracking-wider mb-2">最近比赛</p>
            {matchHistory.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-xs font-tactical">暂无比赛记录</p>
                <VCTButton
                  variant="ghost"
                  size="sm"
                  className="mt-2 min-h-[32px] py-1 text-xs"
                  onClick={() => onNavigate?.('tournaments')}
                >
                  参加赛事 →
                </VCTButton>
              </div>
            ) : (
              <div className="space-y-1.5">
                {getRecentMatches(3).map(match => (
                  <VCTCard key={match.id} className="p-2" corner="all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-display font-semibold truncate">
                          VS {match.opponentName}
                        </p>
                        <p className="text-[10px] text-gray-500 font-tactical">
                          {match.date}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <div className={`text-xs font-display font-bold ${getMatchResultColor(match.result)}`}>
                          {getMatchResultText(match.result)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-tactical">
                          {match.score.team}-{match.score.opponent}
                        </div>
                      </div>
                    </div>
                  </VCTCard>
                ))}
              </div>
            )}
          </div>
        </VCTCard>
      </div>

      {/* VCT时间线 - 可折叠 */}
      <VCTCard corner="all">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">
              VCT {currentSeason} 赛季时间线
            </h2>
            <span className="text-xs text-gray-500 font-tactical">
              下一站: {nextVCTStage?.name || '赛季结束'}
            </span>
          </div>
          <div className="relative overflow-x-auto -mx-1 px-1 pb-1">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-valorant-red/30 via-valorant-cyan/30 to-valorant-gold/30"></div>
            <div className="relative flex items-start gap-4 md:justify-between min-w-max">
              {vctTimeline.slice(0, 6).map((stage, idx) => {
                const isPassed = currentWeek > stage.week;
                const isCurrent = currentWeek === stage.week;
                return (
                  <div key={idx} className="flex flex-col items-center relative w-16 md:w-auto">
                    <div className={`w-3 h-3 clip-corner-sm mb-2 flex-shrink-0 ${
                      isCurrent ? 'bg-valorant-red animate-pulse' :
                      isPassed ? 'bg-valorant-teal' :
                      'bg-gray-700'
                    }`}></div>
                    <div className="text-center">
                      <p className={`text-[10px] font-tactical tracking-wider ${
                        isCurrent ? 'text-valorant-red' :
                        isPassed ? 'text-valorant-teal' :
                        'text-gray-500'
                      }`}>W{stage.week}</p>
                      <p className={`text-xs font-display font-semibold ${
                        isCurrent ? 'text-white' :
                        isPassed ? 'text-gray-300' :
                        'text-gray-600'
                      }`}>{stage.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </VCTCard>

      {/* 设施 + 动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 设施状态 */}
        <VCTCard corner="all">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">设施状态</h2>
            <VCTButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('facility')}
              className="min-h-[32px] py-1 text-xs"
            >
              管理 →
            </VCTButton>
          </div>
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-5 gap-2">
              {playerTeam.facilities.map(facility => (
                <VCTCard key={facility.id} className="p-2" corner="all">
                  <p className="text-[9px] md:text-[10px] text-gray-500 font-tactical tracking-wider text-center truncate">
                    {facility.chineseName}
                  </p>
                  <p className="font-display text-lg md:text-xl font-bold text-valorant-cyan text-center mt-1">
                    {facility.level}
                  </p>
                </VCTCard>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 font-tactical">
                总等级: <span className="text-valorant-cyan font-bold">{totalFacilityLevel}</span>
                <span className="text-gray-600">/{maxFacilityLevel}</span>
              </p>
            </div>
          </div>
        </VCTCard>

        {/* 最新动态 */}
        <VCTCard corner="all">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">最新动态</h2>
            <VCTButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('season')}
              className="min-h-[32px] py-1 text-xs"
            >
              更多 →
            </VCTButton>
          </div>
          <div className="p-3 md:p-4">
            {getRecentNews(4).length === 0 ? (
              <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无动态</p>
            ) : (
              <div className="space-y-2">
                {getRecentNews(4).map(news => (
                  <div key={news.id} className="flex items-start gap-2">
                    <span className={`mt-0.5 flex-shrink-0 ${
                      news.type === 'match' ? 'text-valorant-red' :
                      news.type === 'transfer' ? 'text-valorant-cyan' :
                      news.type === 'injury' ? 'text-red-400' :
                      news.type === 'milestone' ? 'text-purple-400' :
                      'text-valorant-gold'
                    }`}>▸</span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-white text-sm truncate">{news.title}</p>
                      <p className="text-gray-400 font-tactical text-xs truncate">{news.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </VCTCard>
      </div>

      {/* 成就 + 每周挑战 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 成就进度 */}
        <VCTCard corner="all">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">成就进度</h2>
            <VCTButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('achievements')}
              className="min-h-[32px] py-1 text-xs"
            >
              全部 →
            </VCTButton>
          </div>
          <div className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <VCTCard className="p-2 md:p-3 text-center flex-1 mr-2" corner="all">
                <p className="font-display text-xl md:text-2xl font-bold text-valorant-gold">{progress}%</p>
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">完成度</p>
              </VCTCard>
              <VCTCard className="p-2 md:p-3 text-center flex-1" corner="all">
                <p className="font-display text-xl md:text-2xl font-bold text-valorant-cyan">{recentUnlocked.length}</p>
                <p className="text-[10px] text-gray-500 font-tactical tracking-wider">最近解锁</p>
              </VCTCard>
            </div>
            {recentUnlocked.length === 0 ? (
              <p className="text-gray-500 text-xs font-tactical text-center py-4">
                参加比赛、训练选手以解锁成就
              </p>
            ) : (
              <div className="space-y-2">
                {recentUnlocked.slice(0, 3).map(ach => (
                  <VCTCard key={ach.id} className="p-2" corner="all">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ach.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-bold text-white truncate">{ach.name}</p>
                        <p className="text-[10px] text-gray-500 font-tactical truncate">{ach.description}</p>
                      </div>
                      {ach.reward.cash && (
                        <Badge variant="success" size="sm">+${ach.reward.cash.toLocaleString()}</Badge>
                      )}
                    </div>
                  </VCTCard>
                ))}
              </div>
            )}
          </div>
        </VCTCard>

        {/* 每周挑战 */}
        <VCTCard corner="all">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
            <h2 className="font-display text-base md:text-lg text-white tracking-wider">本周挑战</h2>
            {unclaimed.length > 0 && (
              <Badge variant="success" size="sm">{unclaimed.length} 个可领取</Badge>
            )}
          </div>
          <div className="p-3 md:p-4">
            {weeklyChallenges.length === 0 ? (
              <p className="text-gray-500 text-xs font-tactical text-center py-4">本周暂无挑战</p>
            ) : (
              <div className="space-y-2">
                {weeklyChallenges.map(c => (
                  <VCTCard key={c.id} className="p-2" corner="all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-display font-bold text-white truncate flex-1">{c.description}</p>
                      {c.completed && (
                        <Badge variant={c.claimed ? 'default' : 'success'} size="sm">
                          {c.claimed ? '已领' : '完成'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-valorant-dark/60 clip-corner-sm overflow-hidden">
                        <div
                          className={`h-full ${c.completed ? 'bg-valorant-gold' : 'bg-valorant-teal'}`}
                          style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-tactical">
                        {c.progress}/{c.target}
                      </span>
                      {c.completed && !c.claimed && (
                        <VCTButton
                          variant="primary"
                          size="sm"
                          onClick={() => claimChallenge(c.id)}
                          className="min-h-[24px] py-0.5 px-2 text-[10px]"
                        >
                          领取
                        </VCTButton>
                      )}
                    </div>
                  </VCTCard>
                ))}
              </div>
            )}
          </div>
        </VCTCard>
      </div>
    </div>
  );
};

const getRoleName = (role: string): string => {
  const names: Record<string, string> = {
    Duelist: '决斗',
    Controller: '控场',
    Initiator: '先锋',
    Sentinel: '哨卫',
  };
  return names[role] || role;
};
