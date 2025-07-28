interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} font-bold flex items-center space-x-2`}>
      <div className="relative">
        <div className={`${iconSize[size]} bg-hacktion-orange rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-hacktion-blue rounded-full"></div>
      </div>
      <div>
        <span className="text-hacktion-orange">Hack</span>
        <span className="text-hacktion-blue">tion</span>
      </div>
    </div>
  );
}