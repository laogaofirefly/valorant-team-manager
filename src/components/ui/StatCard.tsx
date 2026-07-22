// 统计卡片组件 - 用于展示关键数据

import { VCTCard } from './VCTCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'red' | 'blue' | 'green' | 'yellow';
}

const colorStyles = {
  red: 'text-red-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
};

const trendStyles = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'red',
}: StatCardProps) {
  const colorClass = colorStyles[color];
  const trendClass = trend ? trendStyles[trend] : '';
  const trendIcon = trend ? trendIcons[trend] : '';

  return (
    <VCTCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className={`text-2xl font-oswald font-bold ${colorClass}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`text-3xl ${colorClass} opacity-50`}>
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trendClass}`}>
          <span>{trendIcon}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </VCTCard>
  );
}

// 统计卡片网格
interface StatGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
}

export function StatGrid({ stats, columns = 4 }: StatGridProps) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// 战绩统计
interface RecordStatProps {
  wins: number;
  losses: number;
  draws?: number;
}

export function RecordStat({ wins, losses, draws = 0 }: RecordStatProps) {
  const total = wins + losses + draws;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-400">{wins}</p>
        <p className="text-xs text-gray-500">胜</p>
      </div>
      <div className="text-gray-600">-</div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-400">{losses}</p>
        <p className="text-xs text-gray-500">负</p>
      </div>
      {draws > 0 && (
        <>
          <div className="text-gray-600">-</div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{draws}</p>
            <p className="text-xs text-gray-500">平</p>
          </div>
        </>
      )}
      <div className="ml-4 text-center">
        <p className="text-xl font-bold text-white">{winRate}%</p>
        <p className="text-xs text-gray-500">胜率</p>
      </div>
    </div>
  );
}