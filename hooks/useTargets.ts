// File: hooks/useTargets.ts

import { Colors } from '@/constants/Colors'; // Assuming Colors.light.gameTargetColor1 etc.
import {
    MAX_TARGETS_ON_SCREEN,
    TARGET_OFFSET_TOP,
    TARGET_PADDING,
    TARGET_SIZE_DEFAULT,
} from '@/constants/gameConstants';
import { useCallback, useRef, useState } from 'react'; // Added useRef
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
  shape: 'circle' | 'square'; // Example shapes
  isHitAnimating: boolean; // For visual feedback on hit
  // Add other properties like points, hitsRequired if needed later for more complexity
}

const TARGET_SHAPES: Target['shape'][] = ['circle', 'square'];

export function useTargets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const colorScheme = useColorScheme();
  const targetColors = [
    Colors[colorScheme ?? 'light'].gameTargetColor1,
    Colors[colorScheme ?? 'light'].gameTargetColor2,
    Colors[colorScheme ?? 'light'].gameTargetColor3,
    Colors[colorScheme ?? 'light'].gameTargetColor4,
  ];
  // Using a ref to hold gameAreaDimensions to access inside setTimeout without stale closure issues
  const gameAreaDimensionsRef = useRef<GameAreaDimensions | null>(null);


  const initializeTargets = useCallback((gameArea: GameAreaDimensions | null) => {
    if (!gameArea) return;
    gameAreaDimensionsRef.current = gameArea; // Update the ref
    const newTargets: Target[] = [];
    const availableWidth = gameArea.width - 2 * TARGET_PADDING;
    const availableHeight = gameArea.height * 0.4 - TARGET_OFFSET_TOP; // Use top 40% of screen for targets

    for (let i = 0; i < MAX_TARGETS_ON_SCREEN; i++) {
      // Distribute targets more randomly for a playful look
      const targetX = TARGET_PADDING + Math.random() * (availableWidth - TARGET_SIZE_DEFAULT);
      const targetY = TARGET_OFFSET_TOP + Math.random() * (availableHeight - TARGET_SIZE_DEFAULT);

      newTargets.push({
        id: `target-${Date.now()}-${i}`, // Unique ID
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
  }, [setTargets, targetColors]); // Added targetColors

  const handleTargetHit = useCallback((targetId: string): { targetHit: boolean, targetColor: string | null } => {
    let hitTargetDetails: { targetHit: boolean, targetColor: string | null } = { targetHit: false, targetColor: null };

    setTargets(prevTargets =>
      prevTargets.map(target => {
        if (target.id === targetId && target.isActive) {
          hitTargetDetails = { targetHit: true, targetColor: target.color };
          // Start hit animation
          const updatedTarget = { ...target, isHitAnimating: true };

          // After a short delay, reset animation and "reset" or move the target
          setTimeout(() => {
            setTargets(currentSetTargets => currentSetTargets.map(t => { // Use currentSetTargets to avoid stale closure on 'targets'
                if (t.id === targetId) {
                    // Option 2: Keep it active but move it and change color for variety (more playful)
                    const currentDimensions = gameAreaDimensionsRef.current;
                    const newX = TARGET_PADDING + Math.random() * ( (currentDimensions?.width || 300) - 2 * TARGET_PADDING - TARGET_SIZE_DEFAULT);
                    const newY = TARGET_OFFSET_TOP + Math.random() * ( (currentDimensions?.height || 400) * 0.4 - TARGET_OFFSET_TOP - TARGET_SIZE_DEFAULT);
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
          }, 300); // Duration of hit animation + slight delay

          return updatedTarget;
        }
        return target;
      })
    );
    return hitTargetDetails;
  }, [setTargets, targetColors]); // gameAreaDimensionsRef is stable, targetColors also stable if derived from theme that doesn't change rapidly

  const resetTargets = useCallback((gameArea: GameAreaDimensions | null) => {
      initializeTargets(gameArea);
  },[initializeTargets]);

  // This might not be relevant if targets don't get "cleared" in the traditional sense
  // FIX: Corrected variable name
  const allTargetsInteractedOrReplaced = useCallback((): boolean => {
    if (targets.length === 0) return false;
    // For "Playful Discovery", this condition might change.
    // Perhaps all targets are always active until hit, then they respawn.
    // So, this function might not be used to "clear a level".
    return targets.every(target => !target.isActive); // Or some other condition
  }, [targets]);

  return {
    targets,
    initializeTargets,
    handleTargetHit,
    resetTargets,
    // Expose the (now correctly named) function if it's intended to be used
    // allTargetsInteracted: allTargetsInteractedOrReplaced,
  };
}