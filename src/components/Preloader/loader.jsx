// PageLoader.jsx
import React from "react";

const PageLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div
            className="absolute top-1 left-1 w-14 h-14 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"
            style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
          ></div>
        </div>
        <div className="text-white mt-2 text-2xl flex items-center justify-center w-16">Loading....</div>
      </div>
    </div>
  );
};

export default PageLoader;
