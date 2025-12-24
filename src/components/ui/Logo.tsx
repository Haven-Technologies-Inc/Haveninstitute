import logoImage from '../../assets/images/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = ''
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img 
        src={logoImage} 
        alt="Haven Institute Logo" 
        className={`${sizeMap[size]} object-contain`}
      />
      {showText && (
        <div className="text-left">
          <h1 className={`font-bold text-gray-900 dark:text-white ${textSizeMap[size]} ${textClassName}`}>
            Haven Institute
          </h1>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText' | 'textClassName'>) {
  return (
    <img 
      src={logoImage} 
      alt="Haven Institute Logo" 
      className={`${sizeMap[size]} object-contain ${className}`}
    />
  );
}

export default Logo;
