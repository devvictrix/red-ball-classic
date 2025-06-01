// File: hooks/useTargets.ts

import { Colors } from '@/constants/Colors';
import {
  MAX_TARGETS_ON_SCREEN,
  TARGET_OFFSET_TOP,
  TARGET_PADDING,
  TARGET_SIZE_DEFAULT,
} from '@/constants/gameConstants';
import { useCallback, useRef, useState } from 'react';
import { useColorScheme } from './useColorScheme';
import type { GameAreaDimensions } from './useGameDimensions';

export interface Target {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  color: string;
  shape: 'circle' | 'square';
  isHitAnimating: boolean;
}

const TARGET_SHAPES: Target['shape'][] = ['circle', 'square'];

export function useTargets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const colorScheme = useColorScheme() ?? 'light'; // Ensure colorScheme is not undefined
  const targetColors = [
    Colors[colorScheme].gameTargetColor1,
    Colors[colorScheme].gameTargetColor2,
    Colors[colorScheme].gameTargetColor3,
    Colors[colorScheme].gameTargetColor4,
  ];
  const gameAreaDimensionsRef = useRef<GameAreaDimensions | null>(null);

  const initializeTargets = useCallback((gameArea: GameAreaDimensions | null) => {
    if (!gameArea) return;
    gameAreaDimensionsRef.current = gameArea;
    const newTargets: Target[] = [];
    const availableWidth = gameArea.width - 2 * TARGET_PADDING - TARGET_SIZE_DEFAULT;
    const availableHeight = gameArea.height * 0.4 - TARGET_OFFSET_TOP - TARGET_SIZE_DEFAULT;

    for (let i = 0; i < MAX_TARGETS_ON_SCREEN; i++) {
      const targetX = TARGET_PADDING + Math.random() * availableWidth;
      const targetY = TARGET_OFFSET_TOP + Math.random() * availableHeight;

      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        x: targetX,
        y: targetY,
        width: TARGET_SIZE_DEFAULT,
        height: TARGET_SIZE_DEFAULT,
        isActive: true,
        color: targetColors[i % targetColors.length],
        shape: TARGET_SHAPES[i % TARGET_SHAPES.length],
        isHitAnimating: false,
      });
    }
    setTargets(newTargets);
  }, [targetColors]); // setTargets is stable

  const handleTargetHit = useCallback((targetId: string): { targetHit: boolean, targetColor: string | null } => {
    let hitTargetDetails: { targetHit: boolean, targetColor: string | null } = { targetHit: false, targetColor: null };

    setTargets(prevTargets =>
      prevTargets.map(target => {
        if (target.id === targetId && target.isActive) {
          hitTargetDetails = { targetHit: true, targetColor: target.color };
          const updatedTarget = { ...target, isHitAnimating: true };

          setTimeout(() => {
            setTargets(currentSetTargets => currentSetTargets.map(t => {
              if (t.id === targetId) {
                const currentDimensions = gameAreaDimensionsRef.current;
                const availableWidth = (currentDimensions?.width || 300) - 2 * TARGET_PADDING - TARGET_SIZE_DEFAULT;
                const availableHeight = ((currentDimensions?.height || 400) * 0.4) - TARGET_OFFSET_TOP - TARGET_SIZE_DEFAULT;

                const newX = TARGET_PADDING + Math.random() * availableWidth;
                const newY = TARGET_OFFSET_TOP + Math.random() * availableHeight;
                return {
                  ...t,
                  isHitAnimating: false,
                  x: newX,
                  y: newY,
                  color: targetColors[Math.floor(Math.random() * targetColors.length)],
                  shape: TARGET_SHAPES[Math.floor(Math.random() * TARGET_SHAPES.length)],
                };
              }
              return t;
            }));
          }, 400); // Increased duration to allow hit animation to complete

          return updatedTarget;
        }
        return target;
      })
    );
    return hitTargetDetails;
  }, [targetColors]); // setTargets is stable

  const resetTargets = useCallback((gameArea: GameAreaDimensions | null) => {
    initializeTargets(gameArea);
  }, [initializeTargets]);

  return {
    targets,
    initializeTargets,
    handleTargetHit,
    resetTargets,
  };
}