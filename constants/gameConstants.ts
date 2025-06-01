// File: constants/gameConstants.ts

export const BALL_RADIUS = 10;
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 15;
export const PADDLE_Y_OFFSET = 60;

// Arcade Ball Speeds & Difficulty
export const INITIAL_BALL_SPEED_X = 3;
export const INITIAL_BALL_SPEED_Y = -4;
export const MAX_BALL_SPEED_COMPONENT = 10;
export const BASE_PADDLE_HIT_SPEED_INCREASE_FACTOR = 1.02;
export const SCORE_THRESHOLD_FOR_SPEED_INCREASE = 100; // Score interval to increase ball speed
export const SPEED_INCREMENT = 0.25;

// Game Area
export const GAME_ASPECT_RATIO_VALUE = 3 / 4;
export const WEB_GAME_AREA_WIDTH = 375;

// Scoring
export const SCORE_PER_PADDLE_HIT = 1;
export const BRICK_SCORE_VALUE = 10;

// --- Brick Constants (Arcade) ---
export const BRICK_ROW_COUNT = 5;
export const BRICK_COLUMN_COUNT = 7;
export const BRICK_HEIGHT = 20;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 50;
export const BRICK_OFFSET_LEFT = 10;