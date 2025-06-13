// File: hooks/useBricks.ts

import { Colors } from '@/constants/Colors';
import {
  BRICK_COLUMN_COUNT,
  BRICK_HEIGHT,
  BRICK_OFFSET_LEFT,
  BRICK_OFFSET_TOP,
  BRICK_PADDING,
  BRICK_ROW_COUNT,
} from '@/constants/gameConstants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from './useColorScheme';
import type { GameAreaDimensions } from './useGameDimensions';

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  color: string;
  originalColor: string;
  hitsRequired: number;
  currentHits: number;
}

const LOG_PREFIX = "[useBricks]";

const BRICK_TIER_COLORS_LIGHT = [
  Colors.light.brickColor2,
  Colors.light.brickColor1,
  Colors.light.brickColor3,
  Colors.light.brickColor4,
  Colors.light.brickColor5,
];

const BRICK_TIER_COLORS_DARK = [
  Colors.dark.brickColor2,
  Colors.dark.brickColor1,
  Colors.dark.brickColor3,
  Colors.dark.brickColor4,
  Colors.dark.brickColor5,
];

const DAMAGED_COLOR_FACTOR_LIGHT = 0.7;
const DAMAGED_COLOR_FACTOR_DARK = 1.3;

function adjustColor(color: string, factor: number): string {
  if (color.startsWith('#')) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));

    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    // console.log(`${LOG_PREFIX} adjustColor: Input: ${color}, Factor: ${factor}, R:${r},G:${g},B:${b} -> Output: #${hexR}${hexG}${hexB}`);
    return `#${hexR}${hexG}${hexB}`;
  }
  // console.log(`${LOG_PREFIX} adjustColor: Input ${color} not hex, returning original.`);
  return color;
}

export interface InitializeBricksOptions {
  currentScore?: number;
  forcedDebugTier?: number;
}

export function useBricks() {
  // console.log(`${LOG_PREFIX} Hook initialized/re-rendered.`); // Reduced logging for this hook
  const [bricks, setBricks] = useState<Brick[]>([]);
  const colorScheme = useColorScheme() ?? 'light';

  const BRICK_COLORS_FOR_TIERS = colorScheme === 'light' ? BRICK_TIER_COLORS_LIGHT : BRICK_TIER_COLORS_DARK;

  const bricksRef = useRef(bricks); // Create a ref to hold the latest bricks
  useEffect(() => {
    bricksRef.current = bricks; // Update the ref whenever bricks state changes
    // console.log(`${LOG_PREFIX} bricksRef updated. Current count: ${bricksRef.current.length}, Active: ${bricksRef.current.filter(b => b.isActive).length}`);
  }, [bricks]);


  const initializeBricks = useCallback((gameArea: GameAreaDimensions | null, options?: InitializeBricksOptions) => {
    const { currentScore = 0, forcedDebugTier } = options || {};
    console.log(`${LOG_PREFIX} initializeBricks called. GameArea defined: ${!!gameArea}, score: ${currentScore}, forcedDebugTier: ${forcedDebugTier}, colorScheme: ${colorScheme}`);

    if (!gameArea) {
      console.warn(`${LOG_PREFIX} initializeBricks aborted: gameArea is null.`);
      return;
    }

    const newBricks: Brick[] = [];
    const totalBricksWidthArea = gameArea.width - (BRICK_OFFSET_LEFT * 2);
    const brickWidthWithPadding = totalBricksWidthArea / BRICK_COLUMN_COUNT;
    const brickWidth = brickWidthWithPadding - BRICK_PADDING;
    // console.log(`${LOG_PREFIX} initializeBricks: TotalWidthArea: ${totalBricksWidthArea.toFixed(2)}, BrickWidthWithPadding: ${brickWidthWithPadding.toFixed(2)}, BrickWidth: ${brickWidth.toFixed(2)}`);

    let difficultyTier: number;
    if (typeof forcedDebugTier === 'number' && forcedDebugTier >= 1 && forcedDebugTier <= 3) {
      difficultyTier = forcedDebugTier;
      console.log(`${LOG_PREFIX} initializeBricks: USING FORCED DEBUG TIER: ${difficultyTier}`);
    } else {
      difficultyTier = 1;
      if (currentScore >= 500) {
        difficultyTier = 3;
      } else if (currentScore >= 200) {
        difficultyTier = 2;
      }
      // console.log(`${LOG_PREFIX} initializeBricks: Calculated difficultyTier: ${difficultyTier} for score ${currentScore}`);
    }


    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        const brickX = BRICK_OFFSET_LEFT + c * brickWidthWithPadding + BRICK_PADDING / 2;
        const brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING / 2;

        let hitsRequired = 1;
        // Tiered difficulty assignment
        if (difficultyTier === 1) { // Easiest
          // Mostly 1-hit, maybe some 2-hit in later rows
          if (r >= BRICK_ROW_COUNT * 0.7) hitsRequired = 2; // Last ~30% of rows are 2-hit
          else hitsRequired = 1;
        } else if (difficultyTier === 2) { // Medium
          // Mix of 1, 2, 3-hit
          if (r >= BRICK_ROW_COUNT * 0.8) hitsRequired = 3;       // Last 20% are 3-hit
          else if (r >= BRICK_ROW_COUNT * 0.4) hitsRequired = 2; // Middle 40% are 2-hit
          else hitsRequired = 1;                                 // First 40% are 1-hit
        } else { // Hardest (difficultyTier === 3 or higher if debugged)
          // Mostly 2 and 3-hit
          if (r >= BRICK_ROW_COUNT * 0.6) hitsRequired = 3;       // Last 40% are 3-hit
          else if (r >= BRICK_ROW_COUNT * 0.2) hitsRequired = 2; // Middle 40% are 2-hit
          else hitsRequired = 1; // First 20% are 1-hit (or make them 2-hit too for very hard)
        }

        hitsRequired = Math.max(1, Math.min(hitsRequired, BRICK_COLORS_FOR_TIERS.length));
        const baseColorIndex = Math.max(0, hitsRequired - 1);
        const baseColor = BRICK_COLORS_FOR_TIERS[baseColorIndex] || BRICK_COLORS_FOR_TIERS[0];

        const brickData: Brick = {
          id: `brick-${r}-${c}`,
          x: brickX,
          y: brickY,
          width: brickWidth,
          height: BRICK_HEIGHT,
          isActive: true,
          originalColor: baseColor,
          color: baseColor,
          hitsRequired: hitsRequired,
          currentHits: 0,
        };
        newBricks.push(brickData);
        // console.log(`${LOG_PREFIX} initializeBricks: Created brick ${brickData.id}: Pos(${brickX.toFixed(1)},${brickY.toFixed(1)}), Size(${brickWidth.toFixed(1)},${BRICK_HEIGHT}), HitsReq:${hitsRequired}, Color:${baseColor}`);
      }
    }
    setBricks(newBricks);
    console.log(`${LOG_PREFIX} initializeBricks: Bricks set. Total count: ${newBricks.length}. First brick hitsRequired: ${newBricks.length > 0 ? newBricks[0].hitsRequired : 'N/A'}`);
  }, [colorScheme, BRICK_COLORS_FOR_TIERS, setBricks]); // BRICK_COLORS_FOR_TIERS depends on colorScheme. setBricks is stable.

  const handleBrickHit = useCallback((brickId: string): { brickDamaged: boolean, brickBroken: boolean, pointsAwarded: number } => {
    // console.log(`${LOG_PREFIX} handleBrickHit called for brickId: ${brickId}`);
    let brickWasDamaged = false;
    let brickWasBroken = false;
    let points = 0;

    setBricks(prevBricks => {
      // console.log(`${LOG_PREFIX} handleBrickHit: setBricks updater. Target brickId: ${brickId}. prevBricks count: ${prevBricks.length}`);
      const updatedBricks = prevBricks.map(brick => {
        if (brick.id === brickId && brick.isActive) {
          // console.log(`${LOG_PREFIX} handleBrickHit MAP: Matched ACTIVE brick: ${brick.id}, currentHits: ${brick.currentHits}, hitsRequired: ${brick.hitsRequired}, OriginalColor: ${brick.originalColor}`);
          brickWasDamaged = true; // This will be captured by the closure for the return value
          const newHits = brick.currentHits + 1;

          if (newHits >= brick.hitsRequired) {
            brickWasBroken = true; // Captured by closure
            points = brick.hitsRequired * 10;
            // console.log(`${LOG_PREFIX} handleBrickHit MAP: Brick ${brick.id} BROKEN. NewHits: ${newHits}, Points: ${points}. Returning inactive brick.`);
            return { ...brick, isActive: false, currentHits: newHits, color: brick.originalColor }; // Reset to original color on break for clarity or make it transparent
          } else {
            points = 1;
            const damageDisplayFactor = colorScheme === 'light' ? DAMAGED_COLOR_FACTOR_LIGHT : DAMAGED_COLOR_FACTOR_DARK;
            const damageInterpolation = (newHits / brick.hitsRequired);
            let effectiveFactor;
            if (damageDisplayFactor < 1) { // Darkening
              effectiveFactor = 1 - ((1 - damageDisplayFactor) * damageInterpolation);
            } else { // Lightening
              effectiveFactor = 1 + ((damageDisplayFactor - 1) * damageInterpolation);
            }

            const damagedColor = adjustColor(brick.originalColor, effectiveFactor);
            // console.log(`${LOG_PREFIX} handleBrickHit MAP: Brick ${brick.id} DAMAGED. NewHits: ${newHits}, ColorFactor: ${effectiveFactor.toFixed(2)}, NewColor: ${damagedColor}, Points: ${points}`);
            return { ...brick, currentHits: newHits, color: damagedColor };
          }
        }
        return brick;
      });
      // console.log(`${LOG_PREFIX} handleBrickHit: setBricks updater finished. Comparing prevBricks and updatedBricks lengths: ${prevBricks.length} vs ${updatedBricks.length}`);
      return updatedBricks;
    });
    // console.log(`${LOG_PREFIX} handleBrickHit: Returning after scheduling setBricks. brickId: ${brickId}, brickWasDamaged: ${brickWasDamaged}, brickWasBroken: ${brickWasBroken}, pointsAwarded: ${points}`);
    return { brickDamaged: brickWasDamaged, brickBroken: brickWasBroken, pointsAwarded: points };
  }, [colorScheme, setBricks, BRICK_COLORS_FOR_TIERS]); // BRICK_COLORS_FOR_TIERS depends on colorScheme. setBricks is stable.

  const resetBricks = useCallback((gameArea: GameAreaDimensions | null, options?: InitializeBricksOptions) => {
    const { currentScore = 0, forcedDebugTier } = options || {};
    // console.log(`${LOG_PREFIX} resetBricks called. GameArea defined: ${!!gameArea}, score: ${currentScore}, forcedDebugTier: ${forcedDebugTier}`);
    initializeBricks(gameArea, { currentScore, forcedDebugTier });
  }, [initializeBricks]); // initializeBricks is now stable

  const allBricksCleared = useCallback((): boolean => {
    // console.log(`${LOG_PREFIX} allBricksCleared called. Accessing bricksRef.current. Current count: ${bricksRef.current.length}`);
    if (bricksRef.current.length === 0) { // Check if bricks have been initialized at all
      // console.log(`${LOG_PREFIX} allBricksCleared: bricksRef.current is empty, returning false (level not started/no bricks).`);
      return false;
    }
    const result = bricksRef.current.every(brick => !brick.isActive);
    // console.log(`${LOG_PREFIX} allBricksCleared: Result from bricksRef: ${result}. Active bricks in ref: ${bricksRef.current.filter(b => b.isActive).length}`);
    return result;
  }, []); // Now stable, uses ref and no direct state dependency

  return {
    bricks,
    initializeBricks,
    handleBrickHit,
    resetBricks,
    allBricksCleared,
  };
}