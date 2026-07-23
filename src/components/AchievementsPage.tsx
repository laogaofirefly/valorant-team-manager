import { useGameStore } from '@/store/gameStore';
import { useAchievementActions, useChallengeActions, useRetirementActions } from '@/hooks';
import { VCTCard, VCTButton, Badge } from '@/components/ui';
import { images } from '@/data/images';
import { formatCurrency } from '@/utils/helpers';

const CATEGORY_LABELS: Record<string, string> = {
  match: '比赛',
  transfer: '转会',
  finance: '财务',
  training: '训练',
  special: '特殊',
};

const CATEGORY_COLORS: Record<string, string> = {
  match: 'text-valorant-red',
  transfer: 'text-valorant-cyan',
  finance: 'text-valorant-gold',
  training: 'text-valorant-teal',
  special: 'text-purple-400',
};

export const AchievementsPage = () => {
  const { retiredPlayers, coaches, playerTeam } = useGameStore();
  const { unlocked, locked, recentUnlocked, progress, byCategory } = useAchievementActions();
  const { weeklyChallenges, unclaimed, claimChallenge } = useChallengeActions();
  const { availableForCoach, convertToCoach } = useRetirementActions();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部 - 成就进度概览 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-valorant-darker via-valorant-dark to-valorant-darker clip-corner border border-valorant-gold/20 grid-bg">
        {/* 成就页面装饰图 - 奖杯/勋章主题 */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${images.achievementsDecoration})`, backgroundColor: '#1a1408' }}
          aria-hidden="true"
        />
        <div className="scan-line"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning" size="sm">ACHIEVEMENTS</Badge>
                <span className="text-xs text-gray-500 font-tactical tracking-wider">
                  已解锁 {unlocked.length} / {unlocked.length + locked.length}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wider">成就中心</h1>
              <p className="text-gray-400 mt-1 font-tactical text-sm">
                解锁成就获取现金、声望与粉丝奖励
              </p>
            </div>
            <VCTCard variant="dark" corner="br" className="px-5 py-3">
              <p className="text-[10px] text-gray-500 font-tactical tracking-wider">完成度</p>
              <p className="font-display text-3xl font-bold text-valorant-gold">{progress}%</p>
            </VCTCard>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="h-2 bg-valorant-dark/60 clip-corner-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-valorant-cyan via-valorant-teal to-valorant-gold transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近解锁 */}
      {recentUnlocked.length > 0 && (
        <VCTCard variant="default" className="p-5">
          <h2 className="vct-heading font-display text-lg text-white mb-4">最近解锁</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentUnlocked.map(ach => (
              <VCTCard key={ach.id} variant="dark" corner="br" className="p-3 border-valorant-gold/30">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white text-sm truncate">{ach.name}</p>
                    <p className="text-xs text-gray-400 font-tactical">{ach.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(ach.reward.cash ?? 0) > 0 && <Badge variant="success" size="sm">+${formatCurrency(ach.reward.cash!)}</Badge>}
                      {(ach.reward.reputation ?? 0) > 0 && <Badge variant="info" size="sm">声望+{ach.reward.reputation}</Badge>}
                      {(ach.reward.fans ?? 0) > 0 && <Badge variant="primary" size="sm">粉丝+{ach.reward.fans!.toLocaleString()}</Badge>}
                    </div>
                  </div>
                </div>
              </VCTCard>
            ))}
          </div>
        </VCTCard>
      )}

      {/* 每周挑战 */}
      <VCTCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="vct-heading font-display text-lg text-white">每周挑战</h2>
          {unclaimed.length > 0 && (
            <Badge variant="success" size="sm">{unclaimed.length} 个可领取</Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weeklyChallenges.length === 0 ? (
            <p className="text-gray-500 text-xs font-tactical col-span-3 text-center py-6">本周暂无挑战</p>
          ) : weeklyChallenges.map(c => (
            <VCTCard key={c.id} variant="dark" corner="br" className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-display font-bold text-white">{c.description}</p>
                {c.completed && (
                  <Badge variant={c.claimed ? 'default' : 'success'} size="sm">
                    {c.claimed ? '已领取' : '已完成'}
                  </Badge>
                )}
              </div>
              <div className="h-2 bg-valorant-dark/60 clip-corner-sm overflow-hidden mb-2">
                <div
                  className={`h-full transition-all ${c.completed ? 'bg-valorant-gold' : 'bg-valorant-teal'}`}
                  style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 font-tactical mb-2">
                进度: {c.progress} / {c.target}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(c.reward.cash ?? 0) > 0 && <Badge variant="success" size="sm">+${formatCurrency(c.reward.cash!)}</Badge>}
                {(c.reward.reputation ?? 0) > 0 && <Badge variant="info" size="sm">声望+{c.reward.reputation}</Badge>}
                {(c.reward.fans ?? 0) > 0 && <Badge variant="primary" size="sm">粉丝+{c.reward.fans!.toLocaleString()}</Badge>}
              </div>
              {c.completed && !c.claimed && (
                <VCTButton variant="primary" size="sm" onClick={() => claimChallenge(c.id)} className="w-full">
                  领取奖励
                </VCTButton>
              )}
            </VCTCard>
          ))}
        </div>
      </VCTCard>

      {/* 成就列表 - 按类别分组 */}
      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, items]) => (
          <VCTCard key={category} variant="default" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`vct-heading font-display text-lg ${CATEGORY_COLORS[category] || 'text-white'}`}>
                {CATEGORY_LABELS[category] || category}
              </h2>
              <span className="text-xs text-gray-500 font-tactical">
                {items.filter(i => i.unlocked).length} / {items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(ach => (
                <VCTCard
                  key={ach.id}
                  variant={ach.unlocked ? 'dark' : 'default'}
                  corner="br"
                  className={`p-3 ${ach.unlocked ? 'border-valorant-gold/30' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-2xl ${ach.unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-bold text-sm truncate ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {ach.name}
                      </p>
                      <p className="text-xs text-gray-500 font-tactical">{ach.description}</p>
                      {ach.unlocked && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(ach.reward.cash ?? 0) > 0 && <Badge variant="success" size="sm">+${formatCurrency(ach.reward.cash!)}</Badge>}
                          {(ach.reward.reputation ?? 0) > 0 && <Badge variant="info" size="sm">声望+{ach.reward.reputation}</Badge>}
                          {(ach.reward.fans ?? 0) > 0 && <Badge variant="primary" size="sm">粉丝+{ach.reward.fans!.toLocaleString()}</Badge>}
                        </div>
                      )}
                      {ach.unlocked && ach.unlockedWeek && (
                        <p className="text-[10px] text-valorant-gold/70 font-tactical mt-1">第{ach.unlockedWeek}周解锁</p>
                      )}
                    </div>
                  </div>
                </VCTCard>
              ))}
            </div>
          </VCTCard>
        ))}
      </div>

      {/* 退役选手与教练 */}
      <VCTCard variant="default" className="p-5">
        <h2 className="vct-heading font-display text-lg text-white mb-4">退役与传承</h2>

        {/* 当前教练 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-tactical tracking-wider mb-2">当前教练</p>
          <VCTCard variant="dark" corner="br" className="p-3">
            <p className="font-display font-bold text-white">{playerTeam.coach}</p>
            {coaches.length > 0 && (
              <p className="text-xs text-gray-400 font-tactical mt-1">
                专长：{coaches[coaches.length - 1].specialty}
              </p>
            )}
          </VCTCard>
        </div>

        {/* 可转化为教练的退役选手 */}
        {availableForCoach.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-tactical tracking-wider mb-2">可转型为教练</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableForCoach.map(r => (
                <VCTCard key={r.id} variant="dark" corner="br" className="p-3">
                  <p className="font-display font-bold text-white text-sm">{r.chineseName}</p>
                  <p className="text-xs text-gray-500 font-tactical">
                    {r.nationality} · {r.position} · 退役时{r.age}岁 · 评级{r.rating}
                  </p>
                  <VCTButton
                    variant="primary"
                    size="sm"
                    onClick={() => convertToCoach(r.id)}
                    className="mt-2 w-full"
                  >
                    转型为教练
                  </VCTButton>
                </VCTCard>
              ))}
            </div>
          </div>
        )}

        {/* 退役历史 */}
        {retiredPlayers.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-tactical tracking-wider mb-2">退役名单 ({retiredPlayers.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {retiredPlayers.slice(0, 8).map(r => (
                <VCTCard key={r.id} variant="dark" corner="br" className="p-2">
                  <p className="text-xs font-display font-bold text-white truncate">{r.chineseName}</p>
                  <p className="text-[10px] text-gray-500 font-tactical">
                    {r.position} · {r.isCoach ? '已任教' : '退役'}
                  </p>
                </VCTCard>
              ))}
            </div>
          </div>
        )}

        {retiredPlayers.length === 0 && (
          <p className="text-gray-500 text-xs font-tactical text-center py-4">暂无退役选手记录</p>
        )}
      </VCTCard>
    </div>
  );
};
