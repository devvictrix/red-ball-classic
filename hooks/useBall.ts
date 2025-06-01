// File: hooks/useBall.ts

import {
  BALL_RADIUS,
  BASE_PADDLE_HIT_SPEED_INCREASE_FACTOR,
  INITIAL_BALL_SPEED_X,
  INITIAL_BALL_SPEED_Y,
  MAX_BALL_SPEED_COMPONENT,
  SCORE_THRESHOLD_FOR_SPEED_INCREASE,
  SPEED_INCREMENT,
} from '@/constants/gameConstants';
import { useCallback, useRef, useState } from 'react';
import type { GameAreaDimensions } from './useGameDimensions';

export type BallPosition = { x: number; y: number };
export type BallVelocity = { dx: number; dy: number };

export function useBall() {
  const [position, setPosition] = useState<BallPosition>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<BallVelocity>({
    dx: INITIAL_BALL_SPEED_X,
    dy: INITIAL_BALL_SPEED_Y,
  });
  // To track milestones for speed increase, preventing multiple increases for the same score range
  const speedIncreaseMilestonesReached = useRef(0);

  const resetBall = useCallback((dimensions: GameAreaDimensions | null, paddleY?: number, resetSpeed: boolean = true) => {
    if (dimensions) {
      setPosition({
        x: dimensions.width / 2,
        y: paddleY ? paddleY - BALL_RADIUS * 2 - 5 : dimensions.height / 2, // Start above paddle or center
      });
    } else {
      setPosition({ x: 150, y: 200 }); // Fallback
    }
    if (resetSpeed) {
      setVelocity({ dx: INITIAL_BALL_SPEED_X, dy: INITIAL_BALL_SPEED_Y });
      speedIncreaseMilestonesReached.current = 0;
    }
  }, []); // setPosition and setVelocity are stable

  const updateVelocityOnPaddleHit = useCallback((currentVelocity: BallVelocity, hitPositionOnPaddle: number): BallVelocity => {
    // hitPositionOnPaddle is a value from 0 (left edge) to 1 (right edge)
    let newDy = -currentVelocity.dy * BASE_PADDLE_HIT_SPEED_INCREASE_FACTOR;
    // Adjust dx based on where ball hits paddle: (hitPosition - 0.5) ranges from -0.5 to 0.5
    // Multiply by a factor (e.g., 4 or 5) to make the angle change more pronounced
    let newDx = currentVelocity.dx + (hitPositionOnPaddle - 0.5) * 5;

    // Cap speeds
    newDx = Math.max(-MAX_BALL_SPEED_COMPONENT, Math.min(MAX_BALL_SPEED_COMPONENT, newDx));
    newDy = Math.max(-MAX_BALL_SPEED_COMPONENT, Math.min(MAX_BALL_SPEED_COMPONENT, newDy));
    // Ensure minimum vertical speed to prevent ball from getting too slow vertically
    if (Math.abs(newDy) < Math.abs(INITIAL_BALL_SPEED_Y * 0.8)) {
      newDy = Math.sign(newDy) * Math.abs(INITIAL_BALL_SPEED_Y * 0.8);
    }

    return { dx: newDx, dy: newDy };
  }, []); // Depends only on constants

  const increaseDifficulty = useCallback((currentScore: number, currentVelocity: BallVelocity): BallVelocity => {
    const currentMilestone = Math.floor(currentScore / SCORE_THRESHOLD_FOR_SPEED_INCREASE);
    if (currentMilestone > speedIncreaseMilestonesReached.current) {
      const newDxAbs = Math.min(MAX_BALL_SPEED_COMPONENT, Math.abs(currentVelocity.dx) + SPEED_INCREMENT);
      const newDyAbs = Math.min(MAX_BALL_SPEED_COMPONENT, Math.abs(currentVelocity.dy) + SPEED_INCREMENT);
      speedIncreaseMilestonesReached.current = currentMilestone;
      return {
        dx: currentVelocity.dx > 0 ? newDxAbs : -newDxAbs,
        dy: currentVelocity.dy > 0 ? newDyAbs : -newDyAbs,
      };
    }
    return currentVelocity;
  }, []); // Depends on speedIncreaseMilestonesReached ref

  return {
    ballPosition: position,
    setBallPosition: setPosition,
    ballVelocity: velocity,
    setBallVelocity: setVelocity,
    resetBall,
    updateVelocityOnPaddleHit,
    increaseDifficulty,
  };
}