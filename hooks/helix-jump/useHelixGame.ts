import { HELIX_JUMP_CONFIG as C, HelixJumpConfig } from '@/constants/helixJumpConfig';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import * as THREE from 'three';

// --- Types ---
type GameState = 'IDLE' | 'PLAYING' | 'GAMEOVER' | 'LEVEL_TRANSITION';

type BallState = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: THREE.Vector3;
};

type PlatformData = {
  id: string;
  y: number;
  initialRotation: number;
  passed: boolean;
  config: { GAP_ANGLE: number, KILL_ANGLE: number };
  topY: number;
  bottomY: number;
};

type TowerState = {
  platforms: PlatformData[];
  coreY: number;
  coreHeight: number;
  coreColor: number;
};

export type UseHelixGameReturn = ReturnType<typeof useHelixGame>;

// --- The Master Hook ---
export function useHelixGame() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelMessage, setLevelMessage] = useState('');

  const currentConfigRef = useRef<HelixJumpConfig>(JSON.parse(JSON.stringify(C)));

  // Game Object Refs (for Three.js objects)
  const towerRef = useRef<THREE.Group>(null!);
  const ballRef = useRef<THREE.Mesh>(null!);

  // Game Logic State Refs
  const ballState = useRef<BallState>({
    position: new THREE.Vector3(C.BALL_PROJECTED_RADIUS, C.LEVEL_HEIGHT * 1.5, 0),
    velocity: new THREE.Vector3(),
    scale: new THREE.Vector3(1, 1, 1)
  });
  const [towerState, setTowerState] = useState<TowerState>({ platforms: [], coreY: 0, coreHeight: 0, coreColor: C.COLORS.coreCylinderBase });
  const consecutivePasses = useRef(0);
  const consecutiveDeaths = useRef(0);
  const mercyUsedThisLevel = useRef(false);
  const levelStartTime = useRef(0);

  // Shared values for input
  const towerRotationY = useSharedValue(0);

  // --- Level Manager Logic ---
  const levelManager = useMemo(() => ({
    getConfig: (currentLevel: number, deaths: number): HelixJumpConfig => {
      const config = JSON.parse(JSON.stringify(C)); // Deep copy
      const effectiveLevel = Math.max(0, currentLevel - 1);
      const cappedLevel = Math.min(effectiveLevel, C.MAX_DIFFICULTY_SCALING_LEVEL - 1);

      config.GAP_ANGLE = Math.max(C.MIN_GAP_ANGLE, C.GAP_ANGLE - cappedLevel * C.GAP_ANGLE_REDUCTION_PER_LEVEL);
      config.KILL_ANGLE = Math.min(C.MAX_KILL_ANGLE, C.KILL_ANGLE + cappedLevel * C.KILL_ANGLE_INCREASE_PER_LEVEL);

      const tier = C.DIFFICULTY_TIERS.slice().reverse().find(t => currentLevel >= t.thresholdLevel) || C.DIFFICULTY_TIERS[0];
      config.activeTier = tier;

      return config;
    },
  }), []);

  // --- Game Actions ---
  const prepareNewLevel = useCallback((targetLevel: number) => {
    setGameState('LEVEL_TRANSITION');
    const newConfig = levelManager.getConfig(targetLevel, consecutiveDeaths.current);
    currentConfigRef.current = newConfig;

    setLevel(targetLevel);
    consecutivePasses.current = 0;
    mercyUsedThisLevel.current = false;

    // Build Tower
    const platforms: PlatformData[] = [];
    for (let i = 0; i < newConfig.PLATFORM_COUNT; i++) {
      const y = -i * newConfig.LEVEL_HEIGHT;
      platforms.push({
        id: `p-${i}`,
        y,
        initialRotation: Math.random() * Math.PI * 2,
        passed: false,
        config: { GAP_ANGLE: newConfig.GAP_ANGLE, KILL_ANGLE: newConfig.KILL_ANGLE },
        topY: y + C.PLATFORM_HEIGHT / 2,
        bottomY: y - C.PLATFORM_HEIGHT / 2,
      });
    }
    const coreHeight = newConfig.PLATFORM_COUNT * newConfig.LEVEL_HEIGHT + C.LEVEL_HEIGHT;
    setTowerState({
      platforms,
      coreHeight,
      coreY: - (coreHeight / 2) + C.LEVEL_HEIGHT,
      coreColor: newConfig.activeTier.coreColor,
    });

    // Reset Ball Position
    ballState.current.position.set(C.BALL_PROJECTED_RADIUS, C.LEVEL_HEIGHT * 1.5, 0);
    ballState.current.velocity.set(0, 0, 0);
    if (ballRef.current) ballRef.current.position.copy(ballState.current.position);

    // Reset Tower Rotation
    towerRotationY.value = 0;

    setLevelMessage(`Level ${targetLevel}`);
    setTimeout(() => {
      setGameState('PLAYING');
      levelStartTime.current = Date.now();
    }, C.LEVEL_START_SEQUENCE_TOTAL_DURATION);

  }, [levelManager, towerRotationY]);

  const handleRestart = useCallback(() => {
    setScore(0);
    consecutiveDeaths.current = 0;
    prepareNewLevel(1);
  }, [prepareNewLevel]);

  const triggerGameOver = useCallback(() => {
    setGameState('GAMEOVER');
    setFinalScore(score);
    consecutiveDeaths.current++;
  }, [score]);


  // --- Collision & Game Loop Logic ---
  const normalizeAngle = (angle: number) => {
    let normalized = angle % (2 * Math.PI);
    return normalized < 0 ? normalized + 2 * Math.PI : normalized;
  };

  const gameLoop = useCallback((delta: number) => {
    if (gameState !== 'PLAYING' || !ballRef.current || !towerRef.current) return;

    // Update Ball Physics
    ballState.current.velocity.y += currentConfigRef.current.GRAVITY;
    ballState.current.position.y += ballState.current.velocity.y;
    ballRef.current.position.y = ballState.current.position.y;

    // Update Tower rotation from shared value
    towerRef.current.rotation.y = towerRotationY.value;

    // Collision Detection
    const ballBottom = ballState.current.position.y - C.BALL_RADIUS;
    const isGracePeriod = Date.now() - levelStartTime.current < C.LEVEL_START_GRACE_PERIOD_MS;

    for (const platform of towerState.platforms) {
      if (ballState.current.velocity.y < 0 && ballBottom <= platform.topY && ballBottom > platform.bottomY) {
        const ballAngle = Math.atan2(ballState.current.position.z, ballState.current.position.x);
        const effectiveAngle = normalizeAngle(ballAngle - towerRef.current.rotation.y - platform.initialRotation);

        const { GAP_ANGLE, KILL_ANGLE } = platform.config;
        let segmentType = 'safe';
        if (effectiveAngle < GAP_ANGLE) segmentType = 'gap';
        else if (effectiveAngle < GAP_ANGLE + KILL_ANGLE) segmentType = 'kill';

        if (segmentType === 'kill' && !isGracePeriod) {
          triggerGameOver();
          return;
        }

        if (segmentType === 'safe' || (segmentType === 'kill' && isGracePeriod)) {
          ballState.current.velocity.y = currentConfigRef.current.BOUNCE_SPEED;
          consecutivePasses.current = 0;
        }
      }

      // Platform Pass Logic
      if (!platform.passed && ballBottom < platform.bottomY) {
        platform.passed = true;
        setScore(s => s + 1);
        consecutivePasses.current++;
        if (consecutivePasses.current > 1) {
          const bonus = (consecutivePasses.current - 1) * C.CONSECUTIVE_PASS_BONUS_FACTOR;
          setScore(s => s + bonus);
        }
      }
    }

    // Level Completion Check
    const towerBottomY = -C.PLATFORM_COUNT * C.LEVEL_HEIGHT;
    if (ballState.current.position.y < towerBottomY) {
      setScore(s => s + C.LEVEL_COMPLETE_SCORE_BONUS);
      prepareNewLevel(level + 1);
      consecutiveDeaths.current = 0;
    }

  }, [gameState, towerState.platforms, triggerGameOver, level, prepareNewLevel, towerRotationY]);

  // Initial game start
  useEffect(() => {
    prepareNewLevel(1);
  }, [prepareNewLevel]);

  return {
    score,
    level,
    comboStreak: consecutivePasses.current,
    isGameOver: gameState === 'GAMEOVER',
    isGameActive: gameState === 'PLAYING',
    finalScore,
    levelMessage,
    towerRef,
    ballRef,
    tower: towerState,
    ball: ballState.current,
    handleRestart,
    gameLoop,
    towerRotationY,
  };
}