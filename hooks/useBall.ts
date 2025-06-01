// File: hooks/useBall.ts

import {
  BALL_RADIUS,
  INITIAL_BALL_SPEED_X_GENTLE,
  INITIAL_BALL_SPEED_Y_GENTLE,
  MAX_BALL_SPEED_GENTLE,
} from '@/constants/gameConstants';
import { useCallback, useState } from 'react';
import type { GameAreaDimensions } from './useGameDimensions';

export type BallPosition = { x: number; y: number };
export type BallVelocity = { dx: number; dy: number };

export function useBall() {
  const [position, setPosition] = useState<BallPosition>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<BallVelocity>({
    dx: INITIAL_BALL_SPEED_X_GENTLE,
    dy: INITIAL_BALL_SPEED_Y_GENTLE,
  });
  const [isVisible, setIsVisible] = useState(true);


  const resetBall = useCallback((dimensions: GameAreaDimensions | null, paddleY: number) => {
    setIsVisible(false); // Hide ball briefly before reset
    // Short delay to make the reset feel less abrupt
    setTimeout(() => {
        if (dimensions) {
          setPosition({
            x: dimensions.width / 2,
            // Start ball a bit above the center, or above paddle
            y: Math.min(dimensions.height / 2, paddleY - BALL_RADIUS * 5),
          });
        } else {
          // Fallback if dimensions not ready (should not happen in normal flow)
          setPosition({ x: 150, y: 150 });
        }
        setVelocity({ dx: INITIAL_BALL_SPEED_X_GENTLE, dy: INITIAL_BALL_SPEED_Y_GENTLE });
        setIsVisible(true); // Make ball visible again
    }, 300);

  }, [setPosition, setVelocity, setIsVisible]);

  const updateVelocityOnPaddleHit = useCallback((currentVelocity: BallVelocity): BallVelocity => {
    // Simple upward bounce, no complex angle or speed increase
    let newDy = -Math.abs(INITIAL_BALL_SPEED_Y_GENTLE); // Ensure it always goes up gently
    let newDx = currentVelocity.dx; // Maintain horizontal direction or make it simpler

    // Randomly give a slight horizontal nudge to prevent overly repetitive bounces
    if (Math.random() < 0.5) {
        newDx = currentVelocity.dx > 0 ? INITIAL_BALL_SPEED_X_GENTLE * 0.7 : -INITIAL_BALL_SPEED_X_GENTLE * 0.7;
    } else {
        newDx = currentVelocity.dx > 0 ? INITIAL_BALL_SPEED_X_GENTLE * 1.3 : -INITIAL_BALL_SPEED_X_GENTLE * 1.3;
        newDx = Math.sign(Math.random() - 0.5) * INITIAL_BALL_SPEED_X_GENTLE; // Or completely random gentle direction
    }


    // Cap speed to ensure it remains gentle
    newDx = Math.max(-MAX_BALL_SPEED_GENTLE, Math.min(MAX_BALL_SPEED_GENTLE, newDx));
    newDy = Math.max(-MAX_BALL_SPEED_GENTLE, Math.min(MAX_BALL_SPEED_GENTLE, newDy));

    return { dx: newDx, dy: newDy };
  }, []);

  // No increaseDifficulty needed for this gentle version
  // const increaseDifficulty = useCallback(...)

  return {
    ballPosition: position,
    setBallPosition: setPosition,
    ballVelocity: velocity,
    setBallVelocity: setVelocity,
    isBallVisible: isVisible,
    setIsBallVisible: setIsVisible,
    resetBall,
    updateVelocityOnPaddleHit,
    // increaseDifficulty removed
  };
}