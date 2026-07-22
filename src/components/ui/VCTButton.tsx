// VCT风格按钮组件

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface VCTButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-red-600 hover:bg-red-500 text-white border-red-500',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600',
  danger: 'bg-red-900 hover:bg-red-800 text-red-200 border-red-700',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700',
  warning: 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
};

export function VCTButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: VCTButtonProps) {
  const baseClass = 'relative inline-flex items-center justify-center gap-2 font-rajdhani font-bold uppercase tracking-wider border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

// 图标按钮
interface VCTIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function VCTIconButton({
  icon,
  variant = 'secondary',
  size = 'md',
  label,
  className = '',
  ...props
}: VCTIconButtonProps) {
  const sizeClass = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-12 h-12 text-lg',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center border-2 transition-all duration-200 ${variantStyles[variant]} ${sizeClass} ${className}`}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}