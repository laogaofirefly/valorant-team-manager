import { useGameStore } from '@/store/gameStore';
import { maps } from '@/data/maps';
import { VCTCard, VCTButton, Badge } from '@/components/ui';
import { FORMAT_NAMES } from '@/types';

export const MatchOverlay = () => {
  const { currentMatch, playerBanMap, playerPickMap, closeCurrentMatch, playerTeam } = useGameStore();

  if (!currentMatch) return null;

  const { phase, bpPhase, mapResults, opponent, tournament, format } = currentMatch;
  const teamName = playerTeam.name;
  const teamWins = mapResults.filter(r => r.winner === teamName).length;
  const oppWins = mapResults.filter(r => r.winner === opponent?.chineseName).length;

  const currentStep = bpPhase?.steps[bpPhase.currentStep];
  const isPlayerTurn = currentStep?.team === 'player';
  const isBanPhase = currentStep?.type === 'ban';

  const getMapName = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    return map?.chineseName || mapId;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-auto">
        <div className="text-center mb-6">
          {tournament && (
            <Badge variant="info" size="sm" className="mb-2">
              {tournament.chineseName}
            </Badge>
          )}
          <h2 className="font-display text-3xl font-bold text-white tracking-wider">
            {phase === 'bp' ? '地图BP阶段' : phase === 'map-play' ? '比赛进行中' : '比赛结束'}
          </h2>
          <p className="text-gray-400 mt-1 font-tactical text-sm">
            {format && FORMAT_NAMES[format]} · 对阵 {opponent?.chineseName}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <VCTCard variant="dark" corner="all" className="p-4 text-center">
            <p className="text-xs text-gray-500 font-tactical mb-1">我方</p>
            <p className="font-display text-2xl font-bold text-valorant-cyan">{teamName}</p>
            <p className="text-xl font-display font-bold text-white mt-2">
              {phase === 'finished' ? teamWins : '-'}
            </p>
          </VCTCard>
          <VCTCard variant="highlight" corner="all" className="p-4 text-center">
            <p className="text-xs text-valorant-gold font-tactical mb-1">VS</p>
            <p className="font-display text-lg font-bold text-white">
              {phase === 'bp' ? 'MAP PICK' : phase === 'map-play' ? 'LIVE' : 'FINAL'}
            </p>
            <p className="text-sm text-gray-400 font-tactical mt-2">
              {format && FORMAT_NAMES[format]}
            </p>
          </VCTCard>
          <VCTCard variant="dark" corner="all" className="p-4 text-center">
            <p className="text-xs text-gray-500 font-tactical mb-1">对手</p>
            <p className="font-display text-2xl font-bold text-valorant-red">{opponent?.chineseName}</p>
            <p className="text-xl font-display font-bold text-white mt-2">
              {phase === 'finished' ? oppWins : '-'}
            </p>
          </VCTCard>
        </div>

        {phase === 'bp' && bpPhase && (
          <VCTCard variant="default" corner="all" className="p-6">
            <div className="text-center mb-4">
              <p className="text-lg font-display font-bold text-white">
                {isPlayerTurn ? (
                  <span className="text-valorant-cyan">
                    {isBanPhase ? '🔴 请选择要禁用的地图' : '🟢 请选择要使用的地图'}
                  </span>
                ) : (
                  <span className="text-valorant-red">
                    对手正在{isBanPhase ? '禁用' : '选择'}地图...
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 font-tactical mt-1">
                第 {bpPhase.currentStep + 1} / {bpPhase.steps.length} 步
              </p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
              {bpPhase.availableMaps.map(mapId => {
                const map = maps.find(m => m.id === mapId);
                return (
                  <VCTCard
                    key={mapId}
                    variant={isPlayerTurn ? 'highlight' : 'dark'}
                    corner="all"
                    className={`p-3 text-center transition-all ${
                      isPlayerTurn ? 'cursor-pointer hover:scale-105' : 'opacity-60'
                    }`}
                    onClick={() => {
                      if (!isPlayerTurn) return;
                      if (isBanPhase) {
                        playerBanMap(mapId);
                      } else {
                        playerPickMap(mapId);
                      }
                    }}
                  >
                    <div className="w-full h-12 bg-gradient-to-br from-valorant-red/20 to-valorant-dark clip-corner-sm flex items-center justify-center mb-2">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <p className="text-sm font-display font-semibold text-white">
                      {map?.chineseName || mapId}
                    </p>
                    <p className="text-[10px] text-gray-500 font-tactical mt-0.5">
                      {map?.type === 'Attack' ? '进攻方优势' : map?.type === 'Defense' ? '防守方优势' : '均衡'}
                    </p>
                  </VCTCard>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-valorant-cyan font-tactical mb-2 tracking-wider">已选择地图</p>
                <div className="space-y-1.5">
                  {bpPhase.pickedMaps.length === 0 ? (
                    <p className="text-gray-600 text-xs font-tactical">暂无</p>
                  ) : (
                    bpPhase.pickedMaps.map((mapId, idx) => (
                      <div key={mapId} className="flex items-center gap-2 bg-valorant-dark/60 clip-corner-sm px-3 py-2">
                        <Badge variant="success" size="sm">PICK</Badge>
                        <span className="text-sm text-white">{idx + 1}. {getMapName(mapId)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-valorant-red font-tactical mb-2 tracking-wider">已禁用地图</p>
                <div className="space-y-1.5">
                  {bpPhase.bannedMaps.length === 0 ? (
                    <p className="text-gray-600 text-xs font-tactical">暂无</p>
                  ) : (
                    bpPhase.bannedMaps.map((mapId, idx) => (
                      <div key={mapId} className="flex items-center gap-2 bg-valorant-dark/60 clip-corner-sm px-3 py-2">
                        <Badge variant="danger" size="sm">BAN</Badge>
                        <span className="text-sm text-gray-400 line-through">{idx + 1}. {getMapName(mapId)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </VCTCard>
        )}

        {phase === 'map-play' && (
          <VCTCard variant="default" corner="all" className="p-6 text-center">
            <div className="animate-pulse">
              <div className="text-6xl mb-4">⚔️</div>
              <p className="text-xl font-display font-bold text-white mb-2">
                比赛正在进行中...
              </p>
              <p className="text-gray-400 font-tactical">
                选手们正在战场上拼搏
              </p>
            </div>
          </VCTCard>
        )}

        {phase === 'finished' && (
          <VCTCard variant="highlight" corner="all" className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {teamWins > oppWins ? '🏆' : '💪'}
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                {teamWins > oppWins ? '胜利！' : '惜败'}
              </h3>
              <p className="text-4xl font-display font-bold text-valorant-cyan">
                {teamWins} - {oppWins}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {mapResults.map((result, idx) => (
                <VCTCard key={idx} variant="dark" corner="br" className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" size="sm">MAP {idx + 1}</Badge>
                      <span className="text-white font-display font-semibold">{result.mapName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-bold ${result.winner !== opponent?.chineseName ? 'text-valorant-cyan' : 'text-gray-500'}`}>
                        {result.teamScore}
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className={`font-display font-bold ${result.winner === opponent?.chineseName ? 'text-valorant-red' : 'text-gray-500'}`}>
                        {result.opponentScore}
                      </span>
                      <Badge variant={result.winner !== opponent?.chineseName ? 'success' : 'danger'} size="sm">
                        {result.winner !== opponent?.chineseName ? 'WIN' : 'LOSS'}
                      </Badge>
                    </div>
                  </div>
                </VCTCard>
              ))}
            </div>

            <VCTButton fullWidth variant="primary" onClick={closeCurrentMatch}>
              确定
            </VCTButton>
          </VCTCard>
        )}
      </div>
    </div>
  );
};
