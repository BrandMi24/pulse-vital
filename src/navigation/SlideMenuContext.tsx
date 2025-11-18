// navigation/SlideMenuContext.tsx
import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 260);

type SlideMenuCtx = {
  translateX: Animated.Value;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SlideMenuContext = createContext<SlideMenuCtx | undefined>(undefined);

export function SlideMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const open = () => {
    setIsOpen(true);
    Animated.timing(translateX, {
      toValue: DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsOpen(false);
    });
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return (
    <SlideMenuContext.Provider
      value={{ translateX, isOpen, open, close, toggle }}
    >
      {children}
    </SlideMenuContext.Provider>
  );
}

export function useSlideMenu() {
  const ctx = useContext(SlideMenuContext);
  if (!ctx) {
    throw new Error('useSlideMenu debe usarse dentro de SlideMenuProvider');
  }
  return ctx;
}
