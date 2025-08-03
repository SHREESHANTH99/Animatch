import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isLoading;
};