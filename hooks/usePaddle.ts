// File: hooks/usePaddle.ts

import { PADDLE_HEIGHT, PADDLE_WIDTH } from '@/constants/gameConstants';
import { useCallback, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { GameAreaDimensions } from './useGameDimensions';

export function usePaddle(gameAreaDimensions: GameAreaDimensions | null, isGameActive: boolean) {
  // paddleCurrentLogicalX is for JS thread logic if needed, though direct shared value use is preferred for animation.
  const [paddleCurrentLogicalX, setPaddleCurrentLogicalX] = useState(0);

  const paddleXShared = useSharedValue(0); // Stores the left offset of the paddle
  const paddleOffsetX = useSharedValue(0); // Stores the offset at the start of a drag
  const paddleScale = useSharedValue(1); // For gentle animation on touch/hit

  const updatePaddleLogicalX = useCallback((newLogicalXCenter: number) => {
    setPaddleCurrentLogicalX(newLogicalXCenter);
  }, []);

  const resetPaddle = useCallback((dimensions: GameAreaDimensions | null) => {
    if (dimensions) {
      const initialX = (dimensions.width - PADDLE_WIDTH) / 2;
      paddleXShared.value = initialX;
      paddleOffsetX.value = initialX;
      runOnJS(updatePaddleLogicalX)(initialX + PADDLE_WIDTH / 2);
    }
  }, [updatePaddleLogicalX, paddleXShared, paddleOffsetX]);

  const panGesture = useMemo(() => Gesture.Pan()
    .onBegin(() => {
        if (!isGameActive) return;
        // Gentle scale animation on touch
        paddleScale.value = withTiming(1.05, { duration: 100 });
    })
    .onUpdate((event) => {
      if (!gameAreaDimensions || !isGameActive) return;
      const newX = paddleOffsetX.value + event.translationX;
      const clampedX = Math.max(0, Math.min(newX, gameAreaDimensions.width - PADDLE_WIDTH));
      paddleXShared.value = clampedX;
      runOnJS(updatePaddleLogicalX)(clampedX + PADDLE_WIDTH / 2);
    })
    .onEnd(() => {
      paddleOffsetX.value = paddleXShared.value;
      paddleScale.value = withTiming(1, { duration: 100 }); // Return to normal scale
    })
    .onFinalize(() => {
        // Ensure scale returns to normal if gesture is cancelled
        paddleScale.value = withTiming(1, { duration: 100 });
    }),
  [gameAreaDimensions, isGameActive, updatePaddleLogicalX, paddleOffsetX, paddleXShared, paddleScale]);

  const animatedPaddleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: paddleXShared.value }, { scale: paddleScale.value }],
    height: PADDLE_HEIGHT, // Ensure height is applied from constants
    width: PADDLE_WIDTH,   // Ensure width is applied from constants
  }));

  // Renamed for clarity, used for ball hit feedback
  const triggerPaddleGentleSquash = useCallback(() => {
    paddleScale.value = withSequence(
        withTiming(0.95, { duration: 75 }), // Gentle squash
        withTiming(1.05, { duration: 75 }), // Gentle stretch back
        withTiming(1, { duration: 75 })
    );
  }, [paddleScale]);

  return {
    paddleXShared, // Still useful for direct observation if needed
    paddleCurrentLogicalX, // Center X for JS logic
    panGesture,
    animatedPaddleStyle,
    resetPaddle,
    triggerPaddleGentleSquash,
  };
}