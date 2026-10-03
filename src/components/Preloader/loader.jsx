import React from 'react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-site flex items-center justify-center z-[9999]">
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-anicrimson-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-anicrimson-500/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-anigold-400/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-aniteal-400/10 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative text-center">
        {/* Loading Spinner */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-transparent border-t-anicrimson-500 border-r-anicrimson-600 rounded-full animate-spin"></div>
          <div className="absolute w-20 h-20 border-4 border-transparent border-t-anigold-500 border-l-anicrimson-400 rounded-full animate-spin" 
               style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
          </div>
          <div className="absolute w-16 h-16 border-4 border-transparent border-b-aniteal-500 border-r-anicrimson-500 rounded-full animate-spin" 
               style={{ animationDuration: '2s' }}>
          </div>
          <div className="absolute w-6 h-6 bg-anicrimson-500 rounded-full animate-pulse shadow-crimson"></div>
        </div>
        
        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white animate-pulse">
            LOADING
          </h2>
          <p className="text-white/50 text-sm font-medium tracking-wider">
            Preparing your experience...
          </p>
        </div>
        
        {/* Bouncing Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-anicrimson-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-anicrimson-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-anigold-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-aniteal-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        </div>
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-anicrimson-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0d0d1a]">
        <div className="h-full bg-anicrimson-500 animate-pulse w-full"></div>
      </div>
    </div>
  );
};

export default PageLoader;