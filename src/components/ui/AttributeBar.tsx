// 属性条组件 - 用于展示选手属性

interface AttributeBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  showValue?: boolean;
  size?: 'sm' | 'md';
}

const colorStyles = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
};

const sizeStyles = {
  sm: 'h-2',
  md: 'h-3',
};

export function AttributeBar({
  label,
  value,
  maxValue = 100,
  color = 'red',
  showValue = true,
  size = 'sm',
}: AttributeBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const colorClass = colorStyles[color];
  const sizeClass = sizeStyles[size];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-12 flex-shrink-0">{label}</span>
      <div className={`flex-1 bg-gray-800 rounded-sm overflow-hidden ${sizeClass}`}>
        <div 
          className={`${colorClass} ${sizeClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-white font-mono w-8 text-right">{value}</span>
      )}
    </div>
  );
}

// 多属性面板
interface AttributePanelProps {
  attributes: Record<string, number>;
  labels?: Record<string, string>;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
}

export function AttributePanel({ 
  attributes, 
  labels,
  color = 'red' 
}: AttributePanelProps) {
  return (
    <div className="space-y-1.5">
      {Object.entries(attributes).map(([key, value]) => (
        <AttributeBar
          key={key}
          label={labels?.[key] || key}
          value={value}
          color={color}
        />
      ))}
    </div>
  );
}

// 圆形进度条
interface CircularProgressProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({
  value,
  maxValue = 100,
  size = 60,
  strokeWidth = 4,
  color = '#FF4655',
  label,
  showValue = true,
  children,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children || <span className="text-sm font-bold text-white">{value}</span>}
        </div>
      )}
      {label && (
        <span className="text-xs text-gray-400 mt-1">{label}</span>
      )}
    </div>
  );
}