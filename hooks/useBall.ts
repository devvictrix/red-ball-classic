// File: hooks/useBall.ts

import type { Sparkle } from '@/components/game/BallView';
import {
  BALL_RADIUS,
  INITIAL_BALL_SPEED_X_GENTLE,
  INITIAL_BALL_SPEED_Y_GENTLE,
  MAX_BALL_SPEED_GENTLE,
  MAX_SPARKLES,
  SPARKLE_DURATION_MS,
  SPARKLE_SIZE,
} from '@/constants/gameConstants';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  const [isSparkling, setIsSparkling] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  // Reverting to `number` for setTimeout ref type, as per common web/RN typing
  const sparkleTimeoutRef = useRef<number | null>(null);
  const sparkleIntervalRef = useRef<number | null>(null); // For the sparkle generation interval
  const sparkleFadeOutIntervalRef = useRef<number | null>(null); // For the sparkle fade out interval


  const resetBall = useCallback((dimensions: GameAreaDimensions | null, paddleY: number) => {
    setIsVisible(false);
    setIsSparkling(false);
    setSparkles([]);
    if (sparkleTimeoutRef.current) {
      clearTimeout(sparkleTimeoutRef.current);
      sparkleTimeoutRef.current = null;
    }
    if (sparkleIntervalRef.current) { // Clear generation interval
      clearInterval(sparkleIntervalRef.current);
      sparkleIntervalRef.current = null;
    }
    if (sparkleFadeOutIntervalRef.current) { // Clear fade out interval
      clearInterval(sparkleFadeOutIntervalRef.current);
      sparkleFadeOutIntervalRef.current = null;
    }

    setTimeout(() => {
      if (dimensions) {
        setPosition({
          x: dimensions.width / 2,
          y: Math.min(dimensions.height / 2, paddleY - BALL_RADIUS * 5),
        });
      } else {
        setPosition({ x: 150, y: 150 });
      }
      setVelocity({ dx: INITIAL_BALL_SPEED_X_GENTLE, dy: INITIAL_BALL_SPEED_Y_GENTLE });
      setIsVisible(true);
    }, 300);
  }, [setPosition, setVelocity, setIsVisible, setIsSparkling, setSparkles]);

  const updateVelocityOnPaddleHit = useCallback((currentVelocity: BallVelocity): BallVelocity => {
    let newDy = -Math.abs(INITIAL_BALL_SPEED_Y_GENTLE);
    let newDx = currentVelocity.dx;
    newDx = Math.sign(Math.random() - 0.5 || 1) * INITIAL_BALL_SPEED_X_GENTLE * (0.7 + Math.random() * 0.6);
    newDx = Math.max(-MAX_BALL_SPEED_GENTLE, Math.min(MAX_BALL_SPEED_GENTLE, newDx));
    newDy = Math.max(-MAX_BALL_SPEED_GENTLE, Math.min(MAX_BALL_SPEED_GENTLE, newDy));
    return { dx: newDx, dy: newDy };
  }, []);

  const activateSparkleTrail = useCallback(() => {
    setIsSparkling(true);
    if (sparkleTimeoutRef.current) {
      clearTimeout(sparkleTimeoutRef.current);
    }
    // window.setTimeout is explicitly for browser-like environments returning number
    sparkleTimeoutRef.current = window.setTimeout(() => {
      setIsSparkling(false);
    }, SPARKLE_DURATION_MS);
  }, [setIsSparkling]);

  useEffect(() => {
    if (isSparkling && isVisible) {
      if (sparkleIntervalRef.current) clearInterval(sparkleIntervalRef.current); // Clear previous interval
      sparkleIntervalRef.current = window.setInterval(() => { // Use window.setInterval
        setSparkles(prevSparkles => {
          const newSparkle: Sparkle = {
            id: `sparkle-${Date.now()}-${Math.random()}`,
            x: position.x + (Math.random() - 0.5) * BALL_RADIUS,
            y: position.y + (Math.random() - 0.5) * BALL_RADIUS,
            opacity: 1,
            size: SPARKLE_SIZE * (0.5 + Math.random() * 0.5),
          };
          const updatedSparkles = [newSparkle, ...prevSparkles];
          return updatedSparkles
            .map(s => ({ ...s, opacity: s.opacity - 0.05 }))
            .filter(s => s.opacity > 0)
            .slice(0, MAX_SPARKLES);
        });
      }, 50);
      // Cleanup function for this effect
      return () => {
        if (sparkleIntervalRef.current) {
          clearInterval(sparkleIntervalRef.current);
          sparkleIntervalRef.current = null;
        }
      };
    } else {
      // Clear the generation interval if not sparkling or ball not visible
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
        sparkleIntervalRef.current = null;
      }
      // Fade out remaining sparkles
      if (sparkles.length > 0) {
        if (sparkleFadeOutIntervalRef.current) clearInterval(sparkleFadeOutIntervalRef.current); // Clear previous interval
        sparkleFadeOutIntervalRef.current = window.setInterval(() => { // Use window.setInterval
          setSparkles(prev => {
            const stillFading = prev
              .map(s => ({ ...s, opacity: s.opacity - 0.1 }))
              .filter(s => s.opacity > 0);
            if (stillFading.length === 0 && sparkleFadeOutIntervalRef.current) {
              clearInterval(sparkleFadeOutIntervalRef.current);
              sparkleFadeOutIntervalRef.current = null;
            }
            return stillFading;
          });
        }, 100);
        // Cleanup function for this specific fade out interval
        return () => {
          if (sparkleFadeOutIntervalRef.current) {
            clearInterval(sparkleFadeOutIntervalRef.current);
            sparkleFadeOutIntervalRef.current = null;
          }
        };
      } else {
        // Ensure no fade out interval is running if there are no sparkles
        if (sparkleFadeOutIntervalRef.current) {
          clearInterval(sparkleFadeOutIntervalRef.current);
          sparkleFadeOutIntervalRef.current = null;
        }
      }
    }
  }, [isSparkling, position.x, position.y, sparkles.length, isVisible]);

  return {
    ballPosition: position,
    setBallPosition: setPosition,
    ballVelocity: velocity,
    setBallVelocity: setVelocity,
    isBallVisible: isVisible,
    setIsBallVisible: setIsVisible,
    sparkles,
    activateSparkleTrail,
    resetBall,
    updateVelocityOnPaddleHit,
  };
}