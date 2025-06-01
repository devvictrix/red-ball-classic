// File: hooks/usePaddle.ts

import { PADDLE_HEIGHT, PADDLE_WIDTH, WEB_GAME_AREA_WIDTH } from '@/constants/gameConstants';
import { useCallback, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { GameAreaDimensions } from './useGameDimensions';

const LOG_PREFIX = "[usePaddle]";

export function usePaddle(gameAreaDimensions: GameAreaDimensions | null, isGameActive: boolean) {
  console.log(`${LOG_PREFIX} Hook initialized/re-rendered. isGameActive: ${isGameActive}, gameAreaDimensions: ${JSON.stringify(gameAreaDimensions)}`);
  const [paddleCurrentLogicalX, setPaddleCurrentLogicalX] = useState(0);

  const paddleXShared = useSharedValue(0);
  const paddleOffsetX = useSharedValue(0); // Stores the paddle's X at the start of a drag
  const paddleScale = useSharedValue(1);

  const updatePaddleLogicalXState = useCallback((newLogicalXCenter: number) => {
    // console.log(`${LOG_PREFIX} updatePaddleLogicalXState called with newLogicalXCenter: ${newLogicalXCenter.toFixed(2)}`);
    setPaddleCurrentLogicalX(newLogicalXCenter);
  }, []);

  const resetPaddle = useCallback((dimensions: GameAreaDimensions | null) => {
    console.log(`${LOG_PREFIX} resetPaddle called. Dimensions: ${JSON.stringify(dimensions)}`);
    let initialX: number;
    if (dimensions) {
      initialX = (dimensions.width - PADDLE_WIDTH) / 2;
    } else {
      initialX = (WEB_GAME_AREA_WIDTH - PADDLE_WIDTH) / 2;
      console.warn(`${LOG_PREFIX} resetPaddle using fallback initialX based on WEB_GAME_AREA_WIDTH.`);
    }
    paddleXShared.value = initialX;
    paddleOffsetX.value = initialX; // Important: Offset should also be reset
    runOnJS(updatePaddleLogicalXState)(initialX + PADDLE_WIDTH / 2);
    console.log(`${LOG_PREFIX} resetPaddle: paddleXShared.value set to ${initialX.toFixed(2)}, paddleOffsetX.value to ${initialX.toFixed(2)}. LogicalX updated.`);
  }, [updatePaddleLogicalXState]);

  const panGesture = useMemo(() => Gesture.Pan()
    .onBegin((event) => {
      // console.log(`${LOG_PREFIX} PanGesture onBegin. isGameActive: ${isGameActive}. Event: ${JSON.stringify(event)}`);
      if (!isGameActive) return;
      // paddleOffsetX.value is already set from onEnd or resetPaddle
    })
    .onUpdate((event) => {
      // console.log(`${LOG_PREFIX} PanGesture onUpdate. isGameActive: ${isGameActive}. TranslationX: ${event.translationX.toFixed(2)}, paddleOffsetX: ${paddleOffsetX.value.toFixed(2)}`);
      if (!gameAreaDimensions || !isGameActive) {
        // console.log(`${LOG_PREFIX} PanGesture onUpdate: Aborted - gameAreaDimensions null or game not active.`);
        return;
      }
      const newX = paddleOffsetX.value + event.translationX;
      const clampedX = Math.max(0, Math.min(newX, gameAreaDimensions.width - PADDLE_WIDTH));
      paddleXShared.value = clampedX;
      // console.log(`${LOG_PREFIX} PanGesture onUpdate: newX: ${newX.toFixed(2)}, clampedX: ${clampedX.toFixed(2)}. Updating paddleXShared.`);
      runOnJS(updatePaddleLogicalXState)(clampedX + PADDLE_WIDTH / 2);
    })
    .onEnd((event) => {
      // console.log(`${LOG_PREFIX} PanGesture onEnd. isGameActive: ${isGameActive}. Event: ${JSON.stringify(event)}`);
      if (!isGameActive) return;
      paddleOffsetX.value = paddleXShared.value; // Persist the final position as the new offset for the next drag
      // console.log(`${LOG_PREFIX} PanGesture onEnd: paddleOffsetX.value updated to ${paddleXShared.value.toFixed(2)}.`);
    }),
    [gameAreaDimensions, isGameActive, updatePaddleLogicalXState, paddleOffsetX, paddleXShared] // Added shared values to deps if their identity matters, though usually stable
  );

  const animatedPaddleStyle = useAnimatedStyle(() => {
    // This style function runs on UI thread, avoid heavy logging here unless for specific style debugging.
    // console.log(`${LOG_PREFIX} animatedPaddleStyle computed. translateX: ${paddleXShared.value.toFixed(2)}, scale: ${paddleScale.value.toFixed(2)}`);
    return {
      transform: [{ translateX: paddleXShared.value }, { scale: paddleScale.value }],
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
    };
  });

  const triggerPaddleHitAnimation = useCallback(() => {
    console.log(`${LOG_PREFIX} triggerPaddleHitAnimation called.`);
    paddleScale.value = withSequence(
      withTiming(1.15, { duration: 60 }),
      withTiming(1, { duration: 100 })
    );
  }, [paddleScale]); // paddleScale is stable

  return {
    paddleXShared,
    paddleCurrentLogicalX,
    panGesture,
    animatedPaddleStyle,
    resetPaddle,
    triggerPaddleHitAnimation,
  };
}