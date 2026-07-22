import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/utils/helpers';
import { regionNames } from '@/data/tournaments';
import type { Tournament, TournamentStage, VCTRegion } from '@/types';
import type { Team } from '@/types';
import { maps } from '@/data/maps';
import { useTournamentActions, useScoutReportActions } from '@/hooks';
import { VCTCard, VCTButton, Badge } from '@/components/ui';
import { FORMAT_NAMES, STAGE_NAMES } from '@/types';
import { storyChapters } from '@/data/story';
import { images } from '@/data/images';

export const TournamentsPage = () => {
  const {
    playerTeam,
    getTeamRating,
    currentWeek,
    gamePhase,
    getOpponentTeams,
    registeredTournaments,
    joinTournament,
    startBP,
    story,
    startStoryChapter,
  } = useGameStore();

  const {
    availableTournaments,
    getOpponentTeams: getOpponents,
  } = useTournamentActions();

  const { scoutOpponent, getReportForTeam } = useScoutReportActions();

  const [filterStage, setFilterStage] = useState<TournamentStage | 'all'>('all');
  const [filterRegion] = useState<VCTRegion | 'all'>('all');
  const [opponentFilterRegion, setOpponentFilterRegion] = useState<Team['region'] | 'all'>('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showOpponentSelect, setShowOpponentSelect] = useState(false);

  const teamRating = getTeamRating();
  const opponentTeams = opponentFilterRegion === 'all'
    ? getOpponents()
    : getOpponents().filter(t => t.region === opponentFilterRegion);

  const filteredTournaments = availableTournaments.filter(t => {
    if (filterStage !== 'all' && t.stage !== filterStage) return false;
    if (filterRegion !== 'all' && t.region !== filterRegion && t.region !== 'International') return false;
    return true;
  });

  const checkCanJoin = (tournament: Tournament) => {
    return playerTeam.budget >= tournament.entryFee && teamRating >= tournament.requiredRank;
  };

  const getRegionName = (region: Team['region']): string => {
    const names: Record<Team['region'], string> = {
      Pacific: '太平洋',
      Americas: '美洲',
      EMEA: 'EMEA',
      China: '中国',
    };
    return names[region];
  };

  const getStageBadgeVariant = (stage: TournamentStage): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    const variants: Record<TournamentStage, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      kickoff: 'primary',
      stage1: 'info',
      masters: 'warning',
      stage2: 'success',
      champions: 'danger',
      challengers: 'default',
      gamechangers: 'default',
    };
    return variants[stage];
  };

  // 获取赛事阶段对应的背景图（仅全球冠军赛与大师赛）
  const getStageBanner = (stage: TournamentStage): string | null => {
    if (stage === 'champions') return images.tournamentStage.champions;
    if (stage === 'masters') return images.tournamentStage.masters;
    return null;
  };

  const handleQuickPlay = (opponent: Team) => {
    const fakeTournament: Tournament = {
      id: 'quick-play',
      name: 'Quick Play',
      chineseName: '友谊赛',
      stage: 'kickoff',
      format: 'BO3',
      region: 'Pacific',
      prizePool: 0,
      entryFee: 0,
      requiredRank: 0,
      duration: 1,
      participants: 2,
      vctPoints: 0,
      mapPool: maps.map(m => m.id),
      description: '快速友谊赛',
      emblemColor: '#FF4655',
    };
    startBP(fakeTournament, opponent);
  };

  const handleJoinTournament = (tournament: Tournament) => {
    if (!checkCanJoin(tournament)) return;
    joinTournament(tournament.id);
  };

  const handleStartTournamentMatch = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowOpponentSelect(true);
  };

  const handleSelectOpponent = (opponent: Team) => {
    if (!selectedTournament) return;
    startBP(selectedTournament, opponent);
    setShowOpponentSelect(false);
    setSelectedTournament(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-valorant-darker via-valorant-dark to-valorant-darker clip-corner border border-valorant-red/20 grid-bg">
        <div className="scan-line"></div>
        <div className="relative p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm">VCT CIRCUIT</Badge>
              <span className="text-xs text-gray-500 font-tactical tracking-wider">SEASON 2025</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wider">赛事中心</h1>
            <p className="text-gray-400 mt-1 font-tactical">VCT全球职业巡回赛 · 冲击世界冠军</p>
          </div>
          <div className="flex items-center gap-4">
            <VCTCard variant="dark" corner="br" className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">TEAM RATING</p>
              <p className="font-display text-xl font-bold text-valorant-gold">{teamRating.toFixed(1)}</p>
            </VCTCard>
            <VCTCard variant="dark" corner="br" className="px-4 py-2">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">VCT POINTS</p>
              <p className="font-display text-xl font-bold text-valorant-cyan">{playerTeam.vctPoints}</p>
            </VCTCard>
          </div>
        </div>
      </div>

      {gamePhase === 'preseason' && (
        <VCTCard variant="highlight" className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-valorant-cyan text-xl">ⓘ</span>
            <div>
              <p className="text-valorant-cyan font-display font-semibold">休赛期 - VCT赛季尚未开始</p>
              <p className="text-gray-400 text-sm mt-0.5">请先组建战队，等待VCT启航赛开赛</p>
            </div>
          </div>
        </VCTCard>
      )}

      <VCTCard variant="default" className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-tactical tracking-wider mr-2">阶段:</span>
          <VCTButton
            variant={filterStage === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterStage('all')}
          >
            全部
          </VCTButton>
          {(['kickoff', 'stage1', 'masters', 'stage2', 'champions', 'challengers', 'gamechangers'] as TournamentStage[]).map(stage => (
            <VCTButton
              key={stage}
              variant={filterStage === stage ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStage(stage)}
            >
              {STAGE_NAMES[stage]}
            </VCTButton>
          ))}
        </div>
      </VCTCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="vct-heading font-display text-lg text-white mb-4">可用赛事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTournaments.map(tournament => (
              <VCTCard
                key={tournament.id}
                variant={checkCanJoin(tournament) ? 'highlight' : 'dark'}
                corner="all"
                className={`overflow-hidden ${checkCanJoin(tournament) ? '' : 'opacity-60'}`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: tournament.emblemColor }}
                ></div>
                {/* 赛事阶段背景图（全球冠军赛 / 大师赛） */}
                {getStageBanner(tournament.stage) && (
                  <div
                    className="relative h-20 md:h-24 bg-cover bg-center bg-valorant-dark"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(15,17,21,0.3), rgba(15,17,21,0.85)), url(${getStageBanner(tournament.stage)})`,
                    }}
                    aria-hidden="true"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-white tracking-wider">
                        {tournament.chineseName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant={getStageBadgeVariant(tournament.stage)} size="sm">
                          {STAGE_NAMES[tournament.stage]}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {regionNames[tournament.region as keyof typeof regionNames]}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {FORMAT_NAMES[tournament.format]}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-valorant-gold">
                        ${tournament.prizePool.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-500 font-tactical">PRIZE POOL</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">{tournament.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="bg-valorant-dark/60 clip-corner-sm p-2">
                      <p className="text-[10px] text-gray-500 font-tactical">ENTRY FEE</p>
                      <p className="text-white font-display font-semibold">{formatCurrency(tournament.entryFee)}</p>
                    </div>
                    <div className="bg-valorant-dark/60 clip-corner-sm p-2">
                      <p className="text-[10px] text-gray-500 font-tactical">REQ RATING</p>
                      <p className={`font-display font-semibold ${teamRating >= tournament.requiredRank ? 'text-valorant-teal' : 'text-red-400'}`}>
                        {tournament.requiredRank}
                      </p>
                    </div>
                    <div className="bg-valorant-dark/60 clip-corner-sm p-2">
                      <p className="text-[10px] text-gray-500 font-tactical">VCT PTS</p>
                      <p className="text-valorant-cyan font-display font-semibold">+{tournament.vctPoints}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 font-tactical tracking-wider mb-1">MAP POOL</p>
                    <div className="flex flex-wrap gap-1">
                      {tournament.mapPool.slice(0, 5).map(mapId => {
                        const map = maps.find(m => m.id === mapId);
                        return (
                          <Badge key={mapId} variant="default" size="sm">
                            {map?.chineseName || mapId}
                          </Badge>
                        );
                      })}
                      {tournament.mapPool.length > 5 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-gray-500 font-tactical">
                          +{tournament.mapPool.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {registeredTournaments.includes(tournament.id) ? (
                    <VCTButton
                      fullWidth
                      variant="primary"
                      onClick={() => handleStartTournamentMatch(tournament)}
                    >
                      开始比赛
                    </VCTButton>
                  ) : (
                    <VCTButton
                      fullWidth
                      variant={checkCanJoin(tournament) && gamePhase !== 'preseason' && playerTeam.players.length > 0 ? 'primary' : 'secondary'}
                      disabled={!checkCanJoin(tournament) || gamePhase === 'preseason' || playerTeam.players.length === 0}
                      onClick={() => handleJoinTournament(tournament)}
                    >
                      {playerTeam.players.length === 0 ? '请先签约选手' :
                        gamePhase === 'preseason' ? '休赛期暂不可参加' :
                          !checkCanJoin(tournament) ? '条件不符' : `报名 (${formatCurrency(tournament.entryFee)})`}
                    </VCTButton>
                  )}
                </div>
              </VCTCard>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 赛前情报分析 */}
          <VCTCard variant="default" className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">赛前情报分析</h3>
            <p className="text-xs text-gray-400 mb-3">花费 $5,000 分析对手战术与弱点</p>

            <div className="max-h-64 overflow-y-auto space-y-1.5 mb-3">
              {opponentTeams.slice(0, 12).map(team => {
                const report = getReportForTeam(team.id);
                return (
                  <VCTCard
                    key={team.id}
                    variant={report ? 'highlight' : 'dark'}
                    corner="br"
                    className="p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-[10px]"
                          style={{ background: team.color }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <span className="text-white text-xs font-display font-semibold">{team.chineseName}</span>
                      </div>
                      <VCTButton
                        variant="ghost"
                        size="sm"
                        onClick={() => scoutOpponent(team.id)}
                        disabled={playerTeam.budget < 5000}
                      >
                        {report ? '更新情报' : '分析'}
                      </VCTButton>
                    </div>
                    {report && (
                      <div className="text-[10px] text-gray-400 font-tactical space-y-0.5">
                        <p>胜率预测: <span className={`font-display font-semibold ${report.winProbability >= 50 ? 'text-valorant-teal' : 'text-valorant-red'}`}>{report.winProbability}%</span></p>
                        <p>打法: <span className="text-gray-300">{report.playstyle}</span></p>
                        <p>弱点: <span className="text-valorant-red">{report.weakness}</span></p>
                        <p>建议: <span className="text-valorant-cyan">{report.recommendedTactic}</span></p>
                      </div>
                    )}
                  </VCTCard>
                );
              })}
            </div>
          </VCTCard>

          <VCTCard variant="default" className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">快速友谊赛</h3>
            <p className="text-xs text-gray-400 mb-3">选择对手一键开始训练赛</p>

            <div className="mb-3">
              <label className="text-[10px] text-gray-500 font-tactical tracking-wider">SELECT REGION</label>
              <select
                value={opponentFilterRegion}
                onChange={(e) => setOpponentFilterRegion(e.target.value as Team['region'] | 'all')}
                className="w-full bg-valorant-dark text-white px-2 py-1.5 text-xs clip-corner-sm border border-white/10 mt-1"
              >
                <option value="all">全部赛区</option>
                <option value="Pacific">太平洋</option>
                <option value="Americas">美洲</option>
                <option value="EMEA">EMEA</option>
                <option value="China">中国</option>
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 mb-3">
              {opponentTeams.slice(0, 16).map(team => (
                <VCTCard
                  key={team.id}
                  variant="dark"
                  corner="br"
                  className={`p-2 ${playerTeam.players.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => playerTeam.players.length > 0 && handleQuickPlay(team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 clip-corner-sm flex items-center justify-center text-white font-display font-bold text-xs"
                        style={{ background: team.color }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <span className="text-white text-xs font-display font-semibold">{team.chineseName}</span>
                    </div>
                    <Badge variant={team.overallRating >= 90 ? 'warning' : team.overallRating >= 85 ? 'success' : 'default'} size="sm">
                      {team.overallRating}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-tactical">{getRegionName(team.region)}赛区</p>
                </VCTCard>
              ))}
            </div>

            <VCTCard variant="dark" className="p-2 text-center">
              <p className="text-[10px] text-gray-500 font-tactical">
                {playerTeam.players.length === 0 ? '请先签约选手再进行比赛' : '点击战队即可一键开始BO3比赛'}
              </p>
            </VCTCard>
          </VCTCard>

          <VCTCard variant="highlight" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📖</span>
              <div className="flex-1">
                <h3 className="font-display text-base text-white">剧情模式</h3>
                <p className="text-xs text-gray-400">
                  已解锁 {story.unlockedChapters.length}/{storyChapters.length} 章
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {storyChapters.map(chapter => {
                const isUnlocked = story.unlockedChapters.includes(chapter.id);
                const isCompleted = story.completedChapters.includes(chapter.id);
                return (
                  <div
                    key={chapter.id}
                    className={`flex items-center justify-between p-2 clip-corner-sm ${
                      isUnlocked ? 'bg-valorant-dark/60' : 'bg-valorant-darker/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {isCompleted ? '✅' : isUnlocked ? '▶️' : '🔒'}
                      </span>
                      <div>
                        <p className="text-xs font-display font-semibold text-white">
                          第{chapter.chapterNumber}章 · {chapter.title}
                        </p>
                        <p className="text-[10px] text-gray-500 font-tactical">
                          {chapter.description}
                        </p>
                      </div>
                    </div>
                    {isUnlocked && (
                      <VCTButton
                        variant={isCompleted ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => startStoryChapter(chapter.id)}
                      >
                        {isCompleted ? '回顾' : '开始'}
                      </VCTButton>
                    )}
                  </div>
                );
              })}
            </div>
          </VCTCard>

          <VCTCard variant="default" className="p-4">
            <h3 className="vct-heading font-display text-base text-white mb-3">VCT赛程</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((week) => {
                const futureWeek = currentWeek + week;
                return (
                  <VCTCard key={week} variant="dark" corner="br" className="p-2">
                    <p className="text-xs text-white font-display font-semibold">第 {futureWeek} 周</p>
                    <p className="text-[10px] text-gray-500 font-tactical">待安排赛程</p>
                  </VCTCard>
                );
              })}
            </div>
          </VCTCard>
        </div>
      </div>

      {showOpponentSelect && selectedTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <VCTCard variant="default" corner="all" className="max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-white">
                选择对手
              </h3>
              <button
                onClick={() => setShowOpponentSelect(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {selectedTournament.chineseName} - 选择你的首轮对手
            </p>
            <div className="space-y-2">
              {getOpponentTeams()
                .filter(t => t.region === selectedTournament.region || selectedTournament.region === 'International')
                .slice(0, 8)
                .map(team => (
                  <VCTCard
                    key={team.id}
                    variant="dark"
                    corner="br"
                    className="p-3 cursor-pointer hover:border-valorant-red/50 transition-colors"
                    onClick={() => handleSelectOpponent(team)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 clip-corner-sm flex items-center justify-center text-white font-display font-bold"
                          style={{ background: team.color }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-display font-semibold">{team.chineseName}</p>
                          <p className="text-[10px] text-gray-500 font-tactical">{getRegionName(team.region)}赛区</p>
                        </div>
                      </div>
                      <Badge variant={team.overallRating >= 90 ? 'warning' : team.overallRating >= 85 ? 'success' : 'default'} size="sm">
                        {team.overallRating}
                      </Badge>
                    </div>
                  </VCTCard>
                ))}
            </div>
          </VCTCard>
        </div>
      )}
    </div>
  );
};