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

const LOG_PREFIX = "[useBall]";

export function useBall() {
  console.log(`${LOG_PREFIX} Hook initialized/re-rendered.`);
  const [position, setPosition] = useState<BallPosition>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<BallVelocity>({
    dx: INITIAL_BALL_SPEED_X,
    dy: INITIAL_BALL_SPEED_Y,
  });
  const speedIncreaseMilestonesReached = useRef(0);

  const resetBall = useCallback((dimensions: GameAreaDimensions | null, paddleY?: number, resetSpeed: boolean = true) => {
    console.log(`${LOG_PREFIX} resetBall called. Dimensions: ${JSON.stringify(dimensions)}, paddleY: ${paddleY}, resetSpeed: ${resetSpeed}`);
    let newPos: BallPosition;
    if (dimensions) {
      newPos = {
        x: dimensions.width / 2,
        y: paddleY ? paddleY - BALL_RADIUS * 2 - 5 : dimensions.height / 2,
      };
    } else {
      newPos = { x: 150, y: 200 }; // Fallback
      console.warn(`${LOG_PREFIX} resetBall using fallback position due to null dimensions.`);
    }
    setPosition(newPos);
    console.log(`${LOG_PREFIX} resetBall: Position set to ${JSON.stringify(newPos)}`);

    if (resetSpeed) {
      const initialVel = { dx: INITIAL_BALL_SPEED_X, dy: INITIAL_BALL_SPEED_Y };
      setVelocity(initialVel);
      speedIncreaseMilestonesReached.current = 0;
      console.log(`${LOG_PREFIX} resetBall: Speed reset. Velocity: ${JSON.stringify(initialVel)}, Milestones: 0`);
    } else {
      console.log(`${LOG_PREFIX} resetBall: Speed NOT reset. Current velocity: ${JSON.stringify(velocity.valueOf())}`); // .valueOf() to log current shared value if it were one
    }
  }, []); // setPosition, setVelocity are stable, velocity is only for logging initial state

  const updateVelocityOnPaddleHit = useCallback((currentVelocity: BallVelocity, hitPositionOnPaddle: number): BallVelocity => {
    console.log(`${LOG_PREFIX} updateVelocityOnPaddleHit. CurrentVel: ${JSON.stringify(currentVelocity)}, HitPos: ${hitPositionOnPaddle.toFixed(2)}`);

    let newDy = -currentVelocity.dy * BASE_PADDLE_HIT_SPEED_INCREASE_FACTOR;
    let newDx = currentVelocity.dx + (hitPositionOnPaddle - 0.5) * 5; // Angle change factor: 5

    console.log(`${LOG_PREFIX} updateVelocityOnPaddleHit: Before cap - newDx: ${newDx.toFixed(2)}, newDy: ${newDy.toFixed(2)}`);

    newDx = Math.max(-MAX_BALL_SPEED_COMPONENT, Math.min(MAX_BALL_SPEED_COMPONENT, newDx));
    newDy = Math.max(-MAX_BALL_SPEED_COMPONENT, Math.min(MAX_BALL_SPEED_COMPONENT, newDy));

    if (Math.abs(newDy) < Math.abs(INITIAL_BALL_SPEED_Y * 0.8)) {
      const minVerticalSpeed = Math.sign(newDy) * Math.abs(INITIAL_BALL_SPEED_Y * 0.8);
      console.log(`${LOG_PREFIX} updateVelocityOnPaddleHit: newDy (${newDy.toFixed(2)}) too slow, adjusting to ${minVerticalSpeed.toFixed(2)}`);
      newDy = minVerticalSpeed;
    }
    const resultVel = { dx: newDx, dy: newDy };
    console.log(`${LOG_PREFIX} updateVelocityOnPaddleHit: ResultVel: ${JSON.stringify(resultVel)}`);
    return resultVel;
  }, []);

  const increaseDifficulty = useCallback((currentScore: number, currentVelocity: BallVelocity): BallVelocity => {
    // console.log(`${LOG_PREFIX} increaseDifficulty called. Score: ${currentScore}, CurrentVel: ${JSON.stringify(currentVelocity)}, MilestonesReached: ${speedIncreaseMilestonesReached.current}`);
    const currentMilestone = Math.floor(currentScore / SCORE_THRESHOLD_FOR_SPEED_INCREASE);
    if (currentMilestone > speedIncreaseMilestonesReached.current) {
      console.log(`${LOG_PREFIX} increaseDifficulty: New milestone ${currentMilestone} reached (was ${speedIncreaseMilestonesReached.current}). Score: ${currentScore}. Increasing speed.`);
      const newDxAbs = Math.min(MAX_BALL_SPEED_COMPONENT, Math.abs(currentVelocity.dx) + SPEED_INCREMENT);
      const newDyAbs = Math.min(MAX_BALL_SPEED_COMPONENT, Math.abs(currentVelocity.dy) + SPEED_INCREMENT);
      speedIncreaseMilestonesReached.current = currentMilestone;
      const resultVel = {
        dx: currentVelocity.dx > 0 ? newDxAbs : -newDxAbs,
        dy: currentVelocity.dy > 0 ? newDyAbs : -newDyAbs,
      };
      console.log(`${LOG_PREFIX} increaseDifficulty: Speed increased. New Vel: ${JSON.stringify(resultVel)}, New Milestones: ${speedIncreaseMilestonesReached.current}`);
      return resultVel;
    }
    return currentVelocity;
  }, []);

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