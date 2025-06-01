// File: hooks/usePaddle.ts
import { PADDLE_HEIGHT, PADDLE_WIDTH, WEB_GAME_AREA_WIDTH } from '@/constants/gameConstants'; // Added WEB_GAME_AREA_WIDTH
import { useCallback, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { GameAreaDimensions } from './useGameDimensions';

export function usePaddle(gameAreaDimensions: GameAreaDimensions | null, isGameActive: boolean) {
  const [paddleCurrentLogicalX, setPaddleCurrentLogicalX] = useState(0);

  const paddleXShared = useSharedValue(0);
  const paddleOffsetX = useSharedValue(0);
  const paddleScale = useSharedValue(1);

  const updatePaddleLogicalXState = useCallback((newLogicalXCenter: number) => {
    setPaddleCurrentLogicalX(newLogicalXCenter);
  }, []);

  const resetPaddle = useCallback((dimensions: GameAreaDimensions | null) => {
    let initialX: number;
    if (dimensions) {
      initialX = (dimensions.width - PADDLE_WIDTH) / 2;
    } else {
      // Fallback if dimensions are null, use WEB_GAME_AREA_WIDTH
      initialX = (WEB_GAME_AREA_WIDTH - PADDLE_WIDTH) / 2;
    }
    paddleXShared.value = initialX;
    paddleOffsetX.value = initialX;
    runOnJS(updatePaddleLogicalXState)(initialX + PADDLE_WIDTH / 2);
  }, [updatePaddleLogicalXState]);

  const panGesture = useMemo(() => Gesture.Pan()
    .onUpdate((event) => {
      if (!gameAreaDimensions || !isGameActive) return;
      const newX = paddleOffsetX.value + event.translationX;
      const clampedX = Math.max(0, Math.min(newX, gameAreaDimensions.width - PADDLE_WIDTH));
      paddleXShared.value = clampedX;
      runOnJS(updatePaddleLogicalXState)(clampedX + PADDLE_WIDTH / 2);
    })
    .onEnd(() => {
      if (!isGameActive) return;
      paddleOffsetX.value = paddleXShared.value;
    }),
    [gameAreaDimensions, isGameActive, updatePaddleLogicalXState]);

  const animatedPaddleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: paddleXShared.value }, { scale: paddleScale.value }],
    height: PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
  }));

  const triggerPaddleHitAnimation = useCallback(() => {
    paddleScale.value = withSequence(
      withTiming(1.15, { duration: 60 }),
      withTiming(1, { duration: 100 })
    );
  }, []);

  return {
    paddleXShared, // This is the shared value for the paddle's left offset
    paddleCurrentLogicalX,
    panGesture,
    animatedPaddleStyle,
    resetPaddle,
    triggerPaddleHitAnimation,
  };
}