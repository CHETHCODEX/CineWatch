import React, { useRef, useState, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

const hexToRgba = (hex: string, alpha: number): string => {
  try {
    if (!hex || typeof hex !== 'string') {
      return `rgba(168, 85, 247, ${alpha})`;
    }
    if (!hex.startsWith('#')) {
      if (hex.startsWith('rgb')) return hex;
      return hex;
    }
    let hexValue = hex.slice(1);
    if (hexValue.length === 3) {
      hexValue = hexValue.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexValue.slice(0, 2), 16);
    const g = parseInt(hexValue.slice(2, 4), 16);
    const b = parseInt(hexValue.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return `rgba(168, 85, 247, ${alpha})`; // fallback to purple
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(168, 85, 247, ${alpha})`;
  }
};

const SHIMMER_KEYFRAMES = `
  @keyframes shine-sweep {
    0% { left: -100%; }
    100% { left: 200%; }
  }
  .animate-shine-sweep {
    animation: shine-sweep 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;

const HoverButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  glowColor = '#a855f7', // CineMatch purple glow as default
  backgroundColor, // Keep optional so custom tailwind bg classes show through
  textColor = '#ffffff',
  hoverTextColor = '#ffffff'
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [shimmerKey, setShimmerKey] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShimmerKey(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const hasBgClass = className.includes('bg-') || className.includes('from-');

  // Multi-layered beautiful dynamic shadows + glass highlight bevel
  const boxGlowStyle = {
    boxShadow: isHovered
      ? `0 0 35px ${hexToRgba(glowColor, 0.5)}, 0 0 15px ${hexToRgba(glowColor, 0.25)}, inset 0 1px 0 rgba(255, 255, 255, 0.35)`
      : `0 4px 15px rgba(0, 0, 0, 0.4), 0 0 15px ${hexToRgba(glowColor, 0.15)}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
    ...(backgroundColor && { backgroundColor }),
    color: isHovered ? hoverTextColor : textColor,
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_KEYFRAMES }} />
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative inline-flex items-center justify-center px-8 py-4 border-none",
          "cursor-pointer overflow-hidden transition-all duration-300",
          "text-xl rounded-lg z-10 font-sans font-semibold active:scale-[0.97]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          !backgroundColor && !hasBgClass && "bg-gray-900",
          className
        )}
        style={boxGlowStyle}
      >
        {/* Spotlight Glow Effect Div */}
        <div
          className={`
            absolute w-[220px] h-[220px] rounded-full opacity-60 pointer-events-none 
            transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2
            ${isHovered ? 'scale-120' : 'scale-0'}
          `}
          style={{
            left: `${glowPosition.x}px`,
            top: `${glowPosition.y}px`,
            background: `radial-gradient(circle, ${hexToRgba(glowColor, 0.8)} 0%, ${hexToRgba(glowColor, 0.2)} 40%, transparent 70%)`,
            zIndex: 0,
          }}
        />
        
        {/* Shimmer sweep effect */}
        {isHovered && (
          <div
            key={shimmerKey}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-[2]"
          >
            <div 
              className="absolute top-0 h-full w-[40%] block transform -skew-x-20 bg-gradient-to-r from-transparent via-white/30 to-transparent z-[1] animate-shine-sweep"
              style={{ left: '-100%' }}
            />
          </div>
        )}
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </button>
    </>
  );
};

export { HoverButton };
