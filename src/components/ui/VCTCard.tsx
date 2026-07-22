// VCT风格卡片组件 - 支持斜切角效果

import { ReactNode } from 'react';

interface VCTCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'dark';
  corner?: 'tl' | 'tr' | 'bl' | 'br' | 'all';
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-gray-900 border-gray-700',
  highlight: 'bg-gradient-to-br from-red-950 to-gray-900 border-red-500/30',
  dark: 'bg-gray-950 border-gray-800',
};

const cornerStyles = {
  tl: 'clip-corner-tl',
  tr: 'clip-corner-tr',
  bl: 'clip-corner-bl',
  br: 'clip-corner-br',
  all: 'clip-corner',
};

export function VCTCard({ 
  children, 
  className = '', 
  variant = 'default',
  corner = 'all',
  onClick 
}: VCTCardProps) {
  const baseClass = 'relative overflow-hidden border transition-all duration-300';
  const variantClass = variantStyles[variant];
  const cornerClass = cornerStyles[corner];
  const hoverClass = onClick ? 'cursor-pointer hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20' : '';

  return (
    <div 
      className={`${baseClass} ${variantClass} ${cornerClass} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {/* 扫描线动画 */}
      <div className="absolute inset-0 scan-line pointer-events-none" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// VCT卡片头部
interface VCTCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
}

export function VCTCardHeader({ title, subtitle, icon, action }: VCTCardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h3 className="font-oswald text-lg text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// VCT卡片内容
interface VCTCardContentProps {
  children: ReactNode;
  className?: string;
}

export function VCTCardContent({ children, className = '' }: VCTCardContentProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

// VCT卡片底部
interface VCTCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function VCTCardFooter({ children, className = '' }: VCTCardFooterProps) {
  return (
    <div className={`p-4 border-t border-gray-800 bg-gray-950/50 ${className}`}>
      {children}
    </div>
  );
}