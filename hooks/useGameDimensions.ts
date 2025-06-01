// File: hooks/useGameDimensions.ts
import {
    GAME_ASPECT_RATIO_VALUE,
    WEB_GAME_AREA_WIDTH,
} from '@/constants/gameConstants'; // Assuming you'll move constants here
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform } from 'react-native';

export type GameAreaDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useGameDimensions() {
  const [dimensions, setDimensions] = useState<GameAreaDimensions | null>(null);
  const [hasLayoutBeenSet, setHasLayoutBeenSet] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    let gameWidth = width;
    let gameHeight = height;

    if (Platform.OS === 'web') {
      gameWidth = WEB_GAME_AREA_WIDTH;
      gameHeight = gameWidth / GAME_ASPECT_RATIO_VALUE;
    } else {
      const potentialHeightBasedOnWidth = width / GAME_ASPECT_RATIO_VALUE;
      if (potentialHeightBasedOnWidth <= height) {
        gameHeight = potentialHeightBasedOnWidth;
      } else {
        // Height is the constraining factor
        gameWidth = height * GAME_ASPECT_RATIO_VALUE;
        gameHeight = height;
      }
    }
    
    const finalDimensions = { x, y, width: gameWidth, height: gameHeight };
    setDimensions(finalDimensions);
    
    if (!hasLayoutBeenSet) {
      setHasLayoutBeenSet(true);
    }
  }, [hasLayoutBeenSet]);

  return {
    gameAreaDimensions: dimensions,
    hasLayoutBeenSet,
    handleLayout,
    setHasLayoutBeenSet, // Expose if explicit reset is needed elsewhere
  };
}