import * as THREE from 'three';

// This configuration is based on the original prototype's config.js
// It has been typed and adapted for the React Native/R3F environment.

export const HELIX_JUMP_CONFIG = {
  // Color Palette
  COLORS: {
    ball: 0xffa500, // Orange ball
    safePlatform: 0x3cb371, // MediumSeaGreen
    killPlatform: 0xdc143c, // Crimson
    coreCylinderBase: 0x778899, // LightSlateGray
    ambientLight: 0xffffff,
    hemisphereSky: 0xb0e0e6, // PowderBlue
    hemisphereGround: 0xc0c0c0, // Silver
    directionalLight: 0xffffff,
    background: new THREE.Color(0x0c0a1e), // Scene background from CSS
    fog: 0xb0e0e6, // Fog color
  },

  // Platform and Tower Dimensions
  PLATFORM_COUNT: 7,
  MAX_PLATFORM_COUNT: 15,
  PLATFORM_COUNT_LEVEL_INTERVAL: 3,
  PLATFORM_HEIGHT: 0.5,
  LEVEL_HEIGHT: 4,
  TOWER_RADIUS_INNER: 3,
  TOWER_RADIUS_OUTER: 4,

  // Ball Properties
  BALL_RADIUS: 0.4,
  BALL_PROJECTED_RADIUS: (3 + 4) / 2, // (TOWER_RADIUS_INNER + TOWER_RADIUS_OUTER) / 2

  // Platform Segment Angles (radians)
  GAP_ANGLE: Math.PI / 3,
  MIN_GAP_ANGLE: Math.PI / 7,
  GAP_ANGLE_REDUCTION_PER_LEVEL: 0.015,
  KILL_ANGLE: Math.PI / 3.5,
  MAX_KILL_ANGLE: Math.PI / 2.5,
  KILL_ANGLE_INCREASE_PER_LEVEL: 0.015,

  // Physics and Gameplay
  GRAVITY: -0.015,
  MAX_GRAVITY_MAGNITUDE: -0.025,
  GRAVITY_INCREASE_PER_LEVEL: 0.0003,
  BOUNCE_SPEED: 0.25,
  COMBO_BOUNCE_INCREMENT: 0.003,
  MAX_COMBO_BOUNCE_BONUS: 0.03,

  // Camera Settings
  CAMERA_FOV: 60,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  CAMERA_INITIAL_Y_OFFSET_FACTOR: 1.8,
  CAMERA_INITIAL_X_OFFSET: 12,
  CAMERA_INITIAL_Z_POS: 18,
  CAMERA_FOLLOW_SMOOTHING: 0.05,
  CAMERA_LOOK_AHEAD_Y_FACTOR: 1,

  // Rendering and Shadows
  SHADOW_MAP_SIZE: 2048,

  // Fog
  FOG_ENABLED: true,
  FOG_NEAR_FACTOR: 1.0,
  FOG_FAR_FACTOR: 2.5,

  // Input and Scoring
  INPUT_SENSITIVITY: 0.008,
  LEVEL_COMPLETE_SCORE_BONUS: 10,
  CONSECUTIVE_PASS_BONUS_FACTOR: 1,

  // Difficulty and Level Pacing
  MAX_DIFFICULTY_SCALING_LEVEL: 20,
  LEVEL_START_GRACE_PERIOD_MS: 1500,
  GRACE_PERIOD_FADE_OUT_MS: 300,

  BREATHER_LEVEL_INTERVAL: 5,
  BREATHER_GAP_ANGLE_FACTOR: 1.25,
  BREATHER_KILL_ANGLE_FACTOR: 0.75,
  BREATHER_PLATFORM_COUNT_REDUCTION: 2,
  BREATHER_GRAVITY_FACTOR: 0.85,

  ADAPTIVE_DIFFICULTY_DEATH_THRESHOLD: 3,
  ADAPTIVE_KILL_ANGLE_REDUCTION_FACTOR: 0.9,

  // UX Feedback Timings and Thresholds
  LEVEL_COMPLETE_MESSAGE_DURATION: 2000,
  LEVEL_START_SEQUENCE_TOTAL_DURATION: 2700,

  COMBO_THRESHOLD_MEDIUM: 5,
  COMBO_THRESHOLD_HIGH: 10,
  HIGH_COMBO_STREAK_THRESHOLD_FOR_MERCY: 5,
  MERCY_INDICATOR_DURATION: 1500,

  // Visual Tiers
  DIFFICULTY_TIERS: [
    { thresholdLevel: 1, coreColor: 0x778899 },
    { thresholdLevel: 6, coreColor: 0x6c7a89 },
    { thresholdLevel: 11, coreColor: 0x5f6c79 },
    { thresholdLevel: 16, coreColor: 0x525d68 },
  ],

  // Juice Effects Configuration
  JUICE_EFFECTS: {
    BALL_SQUASH_FACTOR: 0.75,
    BALL_STRETCH_FACTOR: 1.25,
    BALL_SQUASH_STRETCH_DURATION_MS: 160,

    BOUNCE_PARTICLE_COUNT: 15,
    KILL_HIT_PARTICLE_COUNT: 35,
    PLATFORM_BREAK_PARTICLE_COUNT: 12,
    LEVEL_COMPLETE_PARTICLE_COUNT: 70,

    SCREEN_SHAKE_DURATION_MS: 120,
    SCREEN_SHAKE_INTENSITY_WEAK: 0.1, // Adjusted for 3D camera
    SCREEN_SHAKE_INTENSITY_MEDIUM: 0.2,
    SCREEN_SHAKE_INTENSITY_STRONG: 0.35,

    BALL_TRAIL_ENABLED: true,
    BALL_TRAIL_LENGTH: 12,
    BALL_TRAIL_OPACITY_START: 0.4,
    BALL_TRAIL_OPACITY_END: 0.0,

    UI_SCORE_POP_DURATION_MS: 1700,
    UI_SCORE_FLASH_DURATION_MS: 300,
  },
};

export type HelixJumpConfig = typeof HELIX_JUMP_CONFIG;