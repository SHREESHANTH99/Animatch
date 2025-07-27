import React from 'react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-indigo-400/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="relative text-center">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute w-20 h-20 border-4 border-transparent border-t-purple-400 border-l-cyan-400 rounded-full animate-spin" 
               style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
          </div>
          <div className="absolute w-16 h-16 border-4 border-transparent border-b-indigo-400 border-r-blue-400 rounded-full animate-spin" 
               style={{ animationDuration: '2s' }}>
          </div>
          <div className="absolute w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Loading
          </h2>
          <p className="text-gray-300/80 text-sm font-medium tracking-wider">
            Preparing your experience...
          </p>
        </div>
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 animate-pulse"></div>
      </div>
    </div>
  );
};

export default PageLoader;