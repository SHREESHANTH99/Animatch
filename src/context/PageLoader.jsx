import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const usePageLoader = () => {
  const [isLoading, setIsLoading] = useState(false); // Changed to false to disable artificial delay
  const location = useLocation();

  useEffect(() => {
    // Removed artificial delay - now relying on lazy loading suspense
    setIsLoading(false);
  }, [location.pathname]);

  return isLoading;
};
