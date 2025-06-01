// File: hooks/useGameDimensions.ts

import {
  GAME_ASPECT_RATIO_VALUE,
  WEB_GAME_AREA_WIDTH,
} from '@/constants/gameConstants';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform } from 'react-native';

export type GameAreaDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const LOG_PREFIX = "[useGameDimensions]";

export function useGameDimensions() {
  console.log(`${LOG_PREFIX} Hook initialized/re-rendered.`);
  const [dimensions, setDimensions] = useState<GameAreaDimensions | null>(null);
  const [hasLayoutBeenSet, setHasLayoutBeenSet] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log(`${LOG_PREFIX} handleLayout called. Event layout - x:${x.toFixed(1)}, y:${y.toFixed(1)}, width:${width.toFixed(1)}, height:${height.toFixed(1)}. Current hasLayoutBeenSet: ${hasLayoutBeenSet}`);

    let gameWidth = width;
    let gameHeight = height;

    if (Platform.OS === 'web') {
      gameWidth = WEB_GAME_AREA_WIDTH;
      gameHeight = gameWidth / GAME_ASPECT_RATIO_VALUE;
      console.log(`${LOG_PREFIX} handleLayout (Web): Using fixed width. gameWidth: ${gameWidth.toFixed(1)}, gameHeight: ${gameHeight.toFixed(1)}`);
    } else {
      const potentialHeightBasedOnWidth = width / GAME_ASPECT_RATIO_VALUE;
      console.log(`${LOG_PREFIX} handleLayout (Native): Container width: ${width.toFixed(1)}, height: ${height.toFixed(1)}. Potential height based on width: ${potentialHeightBasedOnWidth.toFixed(1)}`);
      if (potentialHeightBasedOnWidth <= height) {
        gameHeight = potentialHeightBasedOnWidth;
        // gameWidth remains 'width'
        console.log(`${LOG_PREFIX} handleLayout (Native): Width is constraining. gameWidth: ${gameWidth.toFixed(1)}, gameHeight: ${gameHeight.toFixed(1)}`);
      } else {
        gameWidth = height * GAME_ASPECT_RATIO_VALUE;
        // gameHeight remains 'height'
        console.log(`${LOG_PREFIX} handleLayout (Native): Height is constraining. gameWidth: ${gameWidth.toFixed(1)}, gameHeight: ${gameHeight.toFixed(1)}`);
      }
    }

    const finalDimensions = { x, y, width: gameWidth, height: gameHeight };
    setDimensions(finalDimensions);
    console.log(`${LOG_PREFIX} handleLayout: Final dimensions set: ${JSON.stringify(finalDimensions)}`);

    if (!hasLayoutBeenSet) {
      setHasLayoutBeenSet(true);
      console.log(`${LOG_PREFIX} handleLayout: hasLayoutBeenSet set to true.`);
    }
  }, [hasLayoutBeenSet]); // hasLayoutBeenSet is a dependency

  return {
    gameAreaDimensions: dimensions,
    hasLayoutBeenSet,
    handleLayout,
    setHasLayoutBeenSet,
  };
}