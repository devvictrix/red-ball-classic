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
import { useCallback, useState } from 'react';
import { useColorScheme } from './useColorScheme'; // To get themed brick colors
import type { GameAreaDimensions } from './useGameDimensions';

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  color: string;
  // Future: hitsRequired, currentHits for multi-hit bricks
}

export function useBricks() {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const colorScheme = useColorScheme() ?? 'light';

  // Define brick colors based on theme
  const BRICK_COLORS_THEMED = [
    Colors[colorScheme].brickColor1,
    Colors[colorScheme].brickColor2,
    Colors[colorScheme].brickColor3,
    Colors[colorScheme].brickColor4,
    Colors[colorScheme].brickColor5,
  ];

  const initializeBricks = useCallback((gameArea: GameAreaDimensions | null) => {
    if (!gameArea) return;
    const newBricks: Brick[] = [];
    // Calculate brick width based on game area width, column count, and padding
    const totalBricksWidthArea = gameArea.width - (BRICK_OFFSET_LEFT * 2); // Account for left and right offset
    const brickWidthWithPadding = totalBricksWidthArea / BRICK_COLUMN_COUNT;
    const brickWidth = brickWidthWithPadding - BRICK_PADDING;

    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        const brickX = BRICK_OFFSET_LEFT + c * brickWidthWithPadding + BRICK_PADDING / 2;
        const brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING / 2;
        newBricks.push({
          id: `brick-${r}-${c}`,
          x: brickX,
          y: brickY,
          width: brickWidth,
          height: BRICK_HEIGHT,
          isActive: true,
          color: BRICK_COLORS_THEMED[r % BRICK_COLORS_THEMED.length], // Cycle through themed colors
        });
      }
    }
    setBricks(newBricks);
  }, [setBricks, BRICK_COLORS_THEMED]); // Depend on themed colors

  const handleBrickHit = useCallback((brickId: string): { brickBroken: boolean, brickColor: string | null } => {
    let brokenBrickColor: string | null = null;
    let brickWasActuallyBroken = false;
    setBricks(prevBricks =>
      prevBricks.map(brick => {
        if (brick.id === brickId && brick.isActive) {
          brokenBrickColor = brick.color;
          brickWasActuallyBroken = true;
          return { ...brick, isActive: false };
        }
        return brick;
      })
    );
    return { brickBroken: brickWasActuallyBroken, brickColor: brokenBrickColor };
  }, [setBricks]); // setBricks is stable

  const resetBricks = useCallback((gameArea: GameAreaDimensions | null) => {
      initializeBricks(gameArea);
  },[initializeBricks]);

  const allBricksCleared = useCallback((): boolean => {
    if (bricks.length === 0) return false; // No bricks to clear
    return bricks.every(brick => !brick.isActive);
  }, [bricks]);

  return {
    bricks,
    initializeBricks, // Keep for potential re-use if game state allows
    handleBrickHit,
    resetBricks,
    allBricksCleared,
  };
}