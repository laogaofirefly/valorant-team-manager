// 徽章组件 - 用于状态、角色等标签显示

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-700 text-gray-300 border-gray-600',
  primary: 'bg-red-600/20 text-red-400 border-red-500/50',
  success: 'bg-green-600/20 text-green-400 border-green-500/50',
  warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50',
  danger: 'bg-red-900/30 text-red-300 border-red-700/50',
  info: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const baseClass = 'inline-flex items-center gap-1 font-rajdhani font-medium border rounded-sm uppercase tracking-wide';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}

// 角色徽章
import { AgentRole } from '@/types';

const roleColors: Record<AgentRole, string> = {
  Duelist: 'primary',
  Controller: 'info',
  Initiator: 'success',
  Sentinel: 'warning',
};

const roleLabels: Record<AgentRole, string> = {
  Duelist: '决斗',
  Controller: '控场',
  Initiator: '先锋',
  Sentinel: '哨兵',
};

interface RoleBadgeProps {
  role: AgentRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant={roleColors[role] as any}>
      {roleLabels[role]}
    </Badge>
  );
}

// 状态徽章
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  label?: string;
}

const statusConfig = {
  active: { variant: 'success' as const, label: '活跃' },
  inactive: { variant: 'default' as const, label: '不活跃' },
  pending: { variant: 'warning' as const, label: '待定' },
  error: { variant: 'danger' as const, label: '错误' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      {label || config.label}
    </Badge>
  );
}

// VCT积分徽章
interface VCTPointsBadgeProps {
  points: number;
}

export function VCTPointsBadge({ points }: VCTPointsBadgeProps) {
  const getColor = (pts: number) => {
    if (pts >= 500) return 'warning';
    if (pts >= 200) return 'primary';
    return 'default';
  };

  return (
    <Badge variant={getColor(points) as any} size="md">
      ★ {points} VCT
    </Badge>
  );
}