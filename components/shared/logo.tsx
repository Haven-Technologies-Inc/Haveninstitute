import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeMap = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25',
          sizeMap[size]
        )}
      >
        <span className="font-bold text-white" style={{ fontSize: size === 'sm' ? 14 : size === 'md' ? 18 : 24 }}>
          H
        </span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight',
              textSizeMap[size]
            )}
          >
            Haven Institute
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-muted-foreground leading-tight tracking-wide">
              NCLEX PREP PLATFORM
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
