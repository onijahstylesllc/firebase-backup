
import { useState, useEffect } from 'react';

const useResponsiveValue = <T,>(mobileValue: T, desktopValue: T, breakpoint = 768): T => {
  const [value, setValue] = useState<T>(desktopValue);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < breakpoint) {
        setValue(mobileValue);
      } else {
        setValue(desktopValue);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [mobileValue, desktopValue, breakpoint]);

  return value;
};

export default useResponsiveValue;
