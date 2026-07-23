import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { roleNames } from '@/data/agents';
import { getPlayerMainAgents } from '@/data/players';
import { images } from '@/data/images';
import { formatCurrency } from '@/utils/helpers';
import type { Player, PlayerAttributes } from '@/data/players';

interface PlayerCardProps {
  player: Player;
  showAction?: boolean;
  actionType?: 'hire' | 'release' | 'train';
}

const attributeNames: Record<keyof PlayerAttributes, string> = {
  aim: '枪法',
  gameSense: '意识',
  teamwork: '配合',
  utility: '道具',
  clutch: '残局',
  entry: '突破',
  support: '支援',
  composure: '抗压',
  leadership: '领导',
  consistency: '稳定',
};

const getAttrColor = (value: number): string => {
  if (value >= 90) return 'text-valorant-gold';
  if (value >= 80) return 'text-valorant-teal';
  if (value >= 70) return 'text-valorant-cyan';
  if (value >= 60) return 'text-gray-300';
  return 'text-red-400';
};

const getAttrBarColor = (value: number): string => {
  if (value >= 90) return 'bg-valorant-gold';
  if (value >= 80) return 'bg-valorant-teal';
  if (value >= 70) return 'bg-valorant-cyan';
  if (value >= 60) return 'bg-gray-500';
  return 'bg-valorant-red';
};

const getRoleStyle = (role: string): { bg: string; text: string; border: string } => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    Duelist: { bg: 'bg-valorant-red/15', text: 'text-valorant-red', border: 'border-valorant-red/40' },
    Controller: { bg: 'bg-valorant-purple/15', text: 'text-valorant-purple', border: 'border-valorant-purple/40' },
    Initiator: { bg: 'bg-valorant-teal/15', text: 'text-valorant-teal', border: 'border-valorant-teal/40' },
    Sentinel: { bg: 'bg-valorant-cyan/15', text: 'text-valorant-cyan', border: 'border-valorant-cyan/40' },
  };
  return styles[role] || { bg: 'bg-gray-700', text: 'text-gray-400', border: 'border-gray-600' };
};

export const PlayerCard = ({ player, showAction = false, actionType = 'hire' }: PlayerCardProps) => {
  const { hirePlayer, releasePlayer, trainPlayer, playerTeam } = useGameStore();
  const budget = playerTeam.budget;
  const [showDetails, setShowDetails] = useState(false);

  const mainAgents = getPlayerMainAgents(player);
  const isOnTeam = player.teamId === playerTeam.id;
  const canAfford = budget >= player.marketValue;
  const canTrain = isOnTeam && budget >= 10000;
  const roleStyle = getRoleStyle(player.position);

  const handleAction = () => {
    if (actionType === 'hire' && canAfford) hirePlayer(player.id);
    if (actionType === 'release') releasePlayer(player.id);
    if (actionType === 'train' && canTrain) trainPlayer(player.id);
  };

  const getActionButton = () => {
    if (!showAction) return null;

    const baseClass = 'w-full min-h-[40px] font-display font-semibold text-xs tracking-wider clip-corner-sm transition-all';
    
    if (actionType === 'hire') {
      return (
        <button
          onClick={handleAction}
          disabled={!canAfford || !player.isFreeAgent}
          className={`${baseClass} ${
            canAfford && player.isFreeAgent
              ? 'bg-valorant-red hover:bg-valorant-red-light text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!player.isFreeAgent ? '已签约' : !canAfford ? '资金不足' : `签约 ${formatCurrency(player.marketValue)}`}
        </button>
      );
    }

    if (actionType === 'release') {
      return (
        <button
          onClick={handleAction}
          className={`${baseClass} bg-valorant-red-dark hover:bg-valorant-red text-white`}
        >
          解约
        </button>
      );
    }

    if (actionType === 'train') {
      return (
        <button
          onClick={handleAction}
          disabled={!canTrain || player.rating >= player.potential || player.fitness < 50}
          className={`${baseClass} ${
            canTrain && player.rating < player.potential && player.fitness >= 50
              ? 'bg-valorant-cyan hover:bg-cyan-400 text-valorant-dark'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {player.rating >= player.potential ? '已满级' : player.fitness < 50 ? '状态不足' : `训练 $10,000`}
        </button>
      );
    }

    return null;
  };

  const keyAttributes: (keyof PlayerAttributes)[] = ['aim', 'gameSense', 'clutch', 'entry'];

  // 按选手定位获取头像区域背景图
  const positionBgUrl = (images.playerPositionBackground as Record<string, string>)[player.position];

  return (
    <div className={`relative bg-valorant-panel/70 clip-corner border overflow-hidden transition-all hover:border-valorant-red/40 ${
      isOnTeam ? 'border-valorant-red/50' : 'border-white/10'
    }`}>
      <div className={`h-1 ${roleStyle.bg.replace('/15', '')}`}></div>

      {/* 选手头像区域 - 角色定位主题背景图 */}
      {positionBgUrl && (
        <div
          className="absolute inset-x-0 top-1 bottom-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${positionBgUrl})`, backgroundColor: '#0f1115' }}
          aria-hidden="true"
        />
      )}

      <div className="relative p-3 md:p-4">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="font-display text-base md:text-lg font-bold text-white tracking-wide truncate">
                {player.chineseName}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 border clip-tag font-tactical font-semibold ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                {roleNames[player.position]}
              </span>
              {player.isProspect && (
                <span className="text-[10px] px-1.5 py-0.5 bg-valorant-purple/20 text-valorant-purple border border-valorant-purple/40 clip-tag font-tactical font-semibold">
                  新秀
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 font-tactical">{player.realName} · {player.nationality} · {player.age}岁</p>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <p className="font-display text-xl md:text-2xl font-bold text-valorant-cyan leading-none">{player.rating}</p>
            <p className="text-[10px] text-gray-500 font-tactical mt-0.5">POT {player.potential}</p>
          </div>
        </div>

        {/* 主英雄 */}
        {mainAgents.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
            {mainAgents.slice(0, 3).map(agent => (
              <span key={agent.id} className="text-[10px] px-1.5 py-0.5 bg-valorant-dark/60 text-gray-300 clip-tag-sm font-tactical">
                {agent.chineseName}
              </span>
            ))}
          </div>
        )}

        {/* 关键属性 */}
        <div className="grid grid-cols-4 gap-1.5 mb-2 md:mb-3">
          {keyAttributes.map(attr => (
            <div key={attr} className="bg-valorant-dark/60 clip-corner-sm p-1.5 text-center">
              <p className="text-gray-500 text-[10px] font-tactical tracking-wider">{attributeNames[attr]}</p>
              <p className={`font-display font-bold ${getAttrColor(player.attributes[attr])}`}>{player.attributes[attr]}</p>
            </div>
          ))}
        </div>

        {/* 核心数据统计 - 移动端紧凑版 */}
        <div className="grid grid-cols-3 gap-1.5 mb-2 md:mb-3">
          <div className="bg-valorant-dark/60 clip-corner-sm p-1.5">
            <p className="text-gray-500 text-[10px] font-tactical tracking-wider">ACS</p>
            <p className="text-white font-display font-semibold text-sm">{player.stats.acs}</p>
          </div>
          <div className="bg-valorant-dark/60 clip-corner-sm p-1.5">
            <p className="text-gray-500 text-[10px] font-tactical tracking-wider">KDA</p>
            <p className="text-white font-display font-semibold text-sm">{player.stats.kda}</p>
          </div>
          <div className="bg-valorant-dark/60 clip-corner-sm p-1.5">
            <p className="text-gray-500 text-[10px] font-tactical tracking-wider">ADR</p>
            <p className="text-white font-display font-semibold text-sm">{player.stats.adr}</p>
          </div>
        </div>

        {/* 状态条 */}
        <div className="grid grid-cols-2 gap-2 mb-2 md:mb-3 text-[10px]">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-gray-500 font-tactical tracking-wider">士气</span>
              <span className="text-white font-display font-semibold">{player.morale}</span>
            </div>
            <div className="tactical-bar">
              <div className="tactical-bar-fill" style={{ width: `${player.morale}%`, background: 'linear-gradient(90deg, #00E5C4, #00D9FF)' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-gray-500 font-tactical tracking-wider">状态</span>
              <span className="text-white font-display font-semibold">{player.fitness}</span>
            </div>
            <div className="tactical-bar">
              <div className="tactical-bar-fill" style={{ width: `${player.fitness}%`, background: 'linear-gradient(90deg, #FFD700, #FF6B7A)' }}></div>
            </div>
          </div>
        </div>

        {/* 成就展示 - 仅显示前2个 */}
        {player.achievements && player.achievements.length > 0 && (
          <div className="mb-2 md:mb-3 flex flex-wrap gap-1">
            {player.achievements.slice(0, 2).map((ach, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-valorant-gold/10 text-valorant-gold border border-valorant-gold/30 clip-tag-sm font-tactical">
                ★ {ach}
              </span>
            ))}
            {player.achievements.length > 2 && (
              <span className="text-[10px] px-1.5 py-0.5 text-gray-500 font-tactical">
                +{player.achievements.length - 2}
              </span>
            )}
          </div>
        )}

        {/* 展开详细属性 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-[10px] text-gray-500 hover:text-valorant-cyan py-1 mb-2 font-tactical tracking-wider transition-all"
        >
          {showDetails ? '收起详细属性 ▲' : '查看详细属性 ▼'}
        </button>

        {showDetails && (
          <div className="bg-valorant-darker/60 clip-corner-sm p-2 md:p-3 mb-2 md:mb-3 space-y-1.5">
            {(Object.keys(attributeNames) as (keyof PlayerAttributes)[]).map(attr => (
              <div key={attr} className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400 font-tactical w-10 flex-shrink-0">{attributeNames[attr]}</span>
                <div className="flex-1 tactical-bar">
                  <div
                    className={`h-full ${getAttrBarColor(player.attributes[attr])}`}
                    style={{ width: `${player.attributes[attr]}%` }}
                  />
                </div>
                <span className={`font-display font-bold w-8 text-right flex-shrink-0 ${getAttrColor(player.attributes[attr])}`}>
                  {player.attributes[attr]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 市场价 */}
        <div className="flex items-center justify-between text-xs mb-2 md:mb-3 pb-2 border-b border-white/5">
          <span className="text-gray-500 font-tactical tracking-wider">市场价值</span>
          <span className="font-display font-bold text-valorant-gold">{formatCurrency(player.marketValue)}</span>
        </div>

        {getActionButton()}
      </div>
    </div>
  );
};
