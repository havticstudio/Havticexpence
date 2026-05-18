import React from 'react';

const Logo = ({ size = 'md', variant = 'light' }) => {
  // size can be 'sm', 'md', 'lg'
  // variant can be 'light' (for dark backgrounds, text is white/teal) or 'dark' (for light backgrounds, text is dark teal/teal)
  
  const iconSizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-14 w-14 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[12px]',
  };

  const textColors = {
    light: {
      first: 'text-white',
      second: 'text-[#80d5cb]', // lighter bright teal
      tagline: 'text-white/40',
    },
    dark: {
      first: 'text-[#191c1e]',
      second: 'text-[#005c55]', // primary corporate teal
      tagline: 'text-[#6e7977]',
    },
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Sleek SVG Logo Icon with Premium Gradient */}
      <div className={`${iconSizes[size]} bg-gradient-to-tr from-[#005c55] to-[#80d5cb] flex items-center justify-center shadow-lg shadow-teal-500/20 transition-all duration-300 hover:scale-105`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5.5 h-5.5' : 'w-8 h-8'}
        >
          {/* Elegant modern minimalist wallet / safe vault with upward growth arrow arrow */}
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h3v-4Z" />
          <path d="M9 14h3v-3" strokeWidth="2.5" />
          <path d="M9 14l4.5-4.5" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`${textSizes[size]} font-black tracking-tight flex items-center`}>
          <span className={textColors[variant].first}>Havtic</span>
          <span className={`${textColors[variant].second} ml-1`}>Expence</span>
        </div>
        <span className={`${subtitleSizes[size]} font-black uppercase tracking-[0.25em] ${textColors[variant].tagline} mt-0.5`}>
          Management
        </span>
      </div>
    </div>
  );
};

export default Logo;
