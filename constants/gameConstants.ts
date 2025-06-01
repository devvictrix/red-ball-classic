// File: constants/gameConstants.ts

// --- Core Playful Discovery Constants ---
export const BALL_RADIUS = 20;
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 25;
export const PADDLE_Y_OFFSET = 70;

// Gentle Ball Speeds
export const INITIAL_BALL_SPEED_X_GENTLE = 1.5;
export const INITIAL_BALL_SPEED_Y_GENTLE = -2.0;
export const MAX_BALL_SPEED_GENTLE = 3;

// Interactive Targets
export const TARGET_SIZE_DEFAULT = 50;
export const TARGET_PADDING = 15;
export const TARGET_OFFSET_TOP = 60;
export const MAX_TARGETS_ON_SCREEN = 3;
export const TARGET_HITS_FOR_BACKGROUND_CHANGE = 5; // Every 5 total target hits
export const TARGET_HITS_FOR_SPARKLE_TRAIL = 8; // Every 8 total target hits

// Sparkle Trail
export const SPARKLE_DURATION_MS = 3000; // 3 seconds
export const MAX_SPARKLES = 15;
export const SPARKLE_SIZE = 5;

// Game Area & Layout
export const GAME_ASPECT_RATIO_VALUE = 3 / 4;
export const WEB_GAME_AREA_WIDTH = 375;