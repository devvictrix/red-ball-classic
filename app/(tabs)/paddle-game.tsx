// File: app/(tabs)/paddle-game.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  StyleSheet,
  View,
  type AppStateStatus,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

import { useBall } from "@/hooks/useBall";
import { useBricks } from "@/hooks/useBricks";
import { useGameDimensions } from "@/hooks/useGameDimensions";
import { useGameSettings } from "@/hooks/useGameSettings";
import { usePaddle } from "@/hooks/usePaddle";
import { useScore } from "@/hooks/useScore";

import { BallView } from "@/components/game/BallView";
import { BrickView } from "@/components/game/BrickView";
import { GameOverlay } from "@/components/game/GameOverlay";
import { PaddleView } from "@/components/game/PaddleView";

import {
  BALL_RADIUS,
  BRICK_SCORE_VALUE,
  GAME_ASPECT_RATIO_VALUE,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_Y_OFFSET,
  SCORE_PER_PADDLE_HIT,
  WEB_GAME_AREA_WIDTH,
} from "@/constants/gameConstants";

const ENABLE_SOUND_FEATURES_MVP = false;

export default function PaddleGameScreen() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOverState, setIsGameOverState] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [hasGameBeenInitialized, setHasGameBeenInitialized] = useState(false);

  const appState = useRef(AppState.currentState);
  const animationFrameId = useRef<number | null>(null);

  const { gameAreaDimensions, hasLayoutBeenSet, handleLayout } =
    useGameDimensions();
  const {
    ballPosition,
    setBallPosition,
    ballVelocity,
    setBallVelocity,
    resetBall,
    updateVelocityOnPaddleHit,
    increaseDifficulty,
  } = useBall();
  const {
    score,
    highScore,
    incrementScoreBy,
    resetScore,
    checkAndSaveHighScore,
  } = useScore(); // Removed setHighScore as it's not typically used directly
  const {
    hapticsEnabled,
    toggleHaptics,
    triggerHapticFeedback,
    soundEnabled,
    toggleSound,
    playSoundEffect,
  } = useGameSettings();
  const {
    // Destructure paddleXShared here
    paddleXShared,
    paddleCurrentLogicalX,
    animatedPaddleStyle,
    panGesture,
    resetPaddle: resetPaddlePosition,
    triggerPaddleHitAnimation,
  } = usePaddle(gameAreaDimensions, isGameActive);
  const {
    bricks,
    initializeBricks,
    handleBrickHit,
    allBricksCleared,
    resetBricks,
  } = useBricks();

  const tapToStartOpacity = useSharedValue(1);
  const gameOverScale = useSharedValue(0);

  const gameBackgroundColor = useThemeColor({}, "gameBackground");
  const gameAreaBackgroundColor = useThemeColor({}, "gameAreaBackground");
  const scoreTextColor = useThemeColor({}, "gameText");
  const borderColor = useThemeColor({}, "gameBorder");

  useEffect(() => {
    if (hasLayoutBeenSet && gameAreaDimensions && !hasGameBeenInitialized) {
      const paddleY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
      resetBall(gameAreaDimensions, paddleY, true);
      resetPaddlePosition(gameAreaDimensions);
      initializeBricks(gameAreaDimensions);
      setHasGameBeenInitialized(true);
      tapToStartOpacity.value = 1;
      gameOverScale.value = 0;
    }
  }, [
    hasLayoutBeenSet,
    gameAreaDimensions,
    resetBall,
    resetPaddlePosition,
    initializeBricks,
    hasGameBeenInitialized,
    tapToStartOpacity,
    gameOverScale,
  ]);

  const startGame = useCallback(
    (isNewLevel: boolean = false) => {
      if (!gameAreaDimensions || !hasGameBeenInitialized) return;
      triggerHapticFeedback("impactMedium");
      playSoundEffect("uiClick");
      if (!isNewLevel) {
        resetScore();
      }
      const paddleY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
      resetBall(gameAreaDimensions, paddleY, !isNewLevel);
      resetPaddlePosition(gameAreaDimensions);
      resetBricks(gameAreaDimensions);
      setLevelCleared(false);
      setIsGameOverState(false);
      setIsGameActive(true);
      tapToStartOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      gameOverScale.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    },
    [
      gameAreaDimensions,
      hasGameBeenInitialized,
      resetBall,
      resetPaddlePosition,
      resetBricks,
      resetScore,
      triggerHapticFeedback,
      playSoundEffect,
      tapToStartOpacity,
      gameOverScale,
    ]
  );

  const performLevelCleared = useCallback(() => {
    setIsGameActive(false);
    setLevelCleared(true);
    setIsGameOverState(false);
    triggerHapticFeedback("notificationSuccess");
    playSoundEffect("levelClear");
    checkAndSaveHighScore();
    gameOverScale.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    tapToStartOpacity.value = withTiming(0, { duration: 0 });
  }, [
    checkAndSaveHighScore,
    triggerHapticFeedback,
    playSoundEffect,
    gameOverScale,
    tapToStartOpacity,
  ]);

  const performGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGameOverState(true);
    setLevelCleared(false);
    triggerHapticFeedback("notificationError");
    playSoundEffect("gameOver");
    checkAndSaveHighScore();
    gameOverScale.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    tapToStartOpacity.value = withTiming(0, { duration: 0 });
  }, [
    checkAndSaveHighScore,
    triggerHapticFeedback,
    playSoundEffect,
    gameOverScale,
    tapToStartOpacity,
  ]);

  useEffect(() => {
    if (!isGameActive || !gameAreaDimensions || !hasLayoutBeenSet) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const gameLoopLogic = () => {
      if (
        !isGameActive ||
        !gameAreaDimensions ||
        !hasLayoutBeenSet ||
        !animationFrameId.current
      ) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        return;
      }

      let newX = ballPosition.x + ballVelocity.dx;
      let newY = ballPosition.y + ballVelocity.dy;
      let newVel = { ...ballVelocity };

      if (
        newX - BALL_RADIUS < 0 ||
        newX + BALL_RADIUS > gameAreaDimensions.width
      ) {
        newVel.dx = -newVel.dx;
        newX = ballPosition.x + newVel.dx;
        triggerHapticFeedback("impactLight");
        playSoundEffect("wallHit");
      }
      if (newY - BALL_RADIUS < 0) {
        newVel.dy = -newVel.dy;
        newY = ballPosition.y + newVel.dy;
        triggerHapticFeedback("impactLight");
        playSoundEffect("wallHit");
      }

      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (brick.isActive) {
          const ballLeft = newX - BALL_RADIUS;
          const ballRight = newX + BALL_RADIUS;
          const ballTop = newY - BALL_RADIUS;
          const ballBottom = newY + BALL_RADIUS;
          const brickLeft = brick.x;
          const brickRight = brick.x + brick.width;
          const brickTop = brick.y;
          const brickBottom = brick.y + brick.height;

          if (
            ballRight > brickLeft &&
            ballLeft < brickRight &&
            ballBottom > brickTop &&
            ballTop < brickBottom
          ) {
            const hitResult = handleBrickHit(brick.id);
            if (hitResult.brickBroken) {
              incrementScoreBy(BRICK_SCORE_VALUE);
              triggerHapticFeedback("impactMedium");
              playSoundEffect("brickBreak");
              const overlapX =
                Math.min(ballRight, brickRight) - Math.max(ballLeft, brickLeft);
              const overlapY =
                Math.min(ballBottom, brickBottom) - Math.max(ballTop, brickTop);
              if (overlapX < overlapY) {
                newVel.dx = -newVel.dx;
              } else {
                newVel.dy = -newVel.dy;
              }
              newX = ballPosition.x + newVel.dx;
              newY = ballPosition.y + newVel.dy;
            }
            break;
          }
        }
      }

      if (allBricksCleared()) {
        performLevelCleared();
        return;
      }

      const paddleTopCollisionY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
      // Use paddleXShared.value directly as it reflects the current animated position
      const currentPaddleLeft = paddleXShared.value;
      const currentPaddleRight = paddleXShared.value + PADDLE_WIDTH;

      if (
        newY + BALL_RADIUS >= paddleTopCollisionY &&
        ballPosition.y + BALL_RADIUS < paddleTopCollisionY &&
        newX + BALL_RADIUS >= currentPaddleLeft &&
        newX - BALL_RADIUS <= currentPaddleRight
      ) {
        const hitPositionOnPaddle = (newX - currentPaddleLeft) / PADDLE_WIDTH;
        newVel = updateVelocityOnPaddleHit(newVel, hitPositionOnPaddle);
        newY = paddleTopCollisionY - BALL_RADIUS;
        incrementScoreBy(SCORE_PER_PADDLE_HIT);
        triggerHapticFeedback("impactMedium");
        playSoundEffect("paddleHit");
        triggerPaddleHitAnimation();
      }

      newVel = increaseDifficulty(score, newVel);

      if (newY + BALL_RADIUS > gameAreaDimensions.height + BALL_RADIUS * 2) {
        performGameOver();
        return;
      }

      setBallPosition({ x: newX, y: newY });
      setBallVelocity(newVel);

      if (animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(gameLoopLogic);
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoopLogic);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [
    isGameActive,
    gameAreaDimensions,
    hasLayoutBeenSet,
    ballPosition,
    ballVelocity,
    setBallPosition,
    setBallVelocity,
    // Ensure paddleXShared is in the dependency array for the game loop
    paddleXShared,
    paddleCurrentLogicalX,
    bricks,
    handleBrickHit,
    allBricksCleared,
    incrementScoreBy,
    score,
    performGameOver,
    performLevelCleared,
    triggerHapticFeedback,
    playSoundEffect,
    triggerPaddleHitAnimation,
    updateVelocityOnPaddleHit,
    increaseDifficulty,
    BALL_RADIUS,
    PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_Y_OFFSET,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          /* ... */
        } else if (nextAppState.match(/inactive|background/) && isGameActive) {
          setIsGameActive(false);
          tapToStartOpacity.value = withTiming(1, {
            duration: 100,
            easing: Easing.in(Easing.ease),
          });
          gameOverScale.value = withTiming(0, { duration: 0 });
        }
        appState.current = nextAppState;
      }
    );
    return () => subscription.remove();
  }, [isGameActive, tapToStartOpacity, gameOverScale]);

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: gameBackgroundColor }}
    >
      <ThemedView style={styles.container}>
        <View style={styles.scoreContainer}>
          <ThemedText type="subtitle" style={{ color: scoreTextColor }}>
            Score: {score}
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: scoreTextColor }}>
            High Score: {highScore}
          </ThemedText>
        </View>
        <View
          style={[
            styles.gameAreaContainer,
            Platform.OS === "web" && {
              width: WEB_GAME_AREA_WIDTH,
              height: WEB_GAME_AREA_WIDTH / GAME_ASPECT_RATIO_VALUE,
              alignSelf: "center",
            },
          ]}
          onLayout={handleLayout}
        >
          {gameAreaDimensions && hasLayoutBeenSet && hasGameBeenInitialized ? (
            <View
              style={{
                width: gameAreaDimensions.width,
                height: gameAreaDimensions.height,
                backgroundColor: gameAreaBackgroundColor,
                borderColor: borderColor,
                borderWidth: 2,
                overflow: "hidden",
              }}
            >
              {bricks.map((brick) => (
                <BrickView key={brick.id} brick={brick} />
              ))}
              {/* Removed sparkles from BallView for arcade version */}
              <BallView position={ballPosition} sparkles={[]} />
              <PaddleView
                panGesture={panGesture}
                animatedStyle={animatedPaddleStyle}
              />
              {(!isGameActive || isGameOverState || levelCleared) && (
                <GameOverlay
                  isGameOver={isGameOverState}
                  levelCleared={levelCleared}
                  score={score}
                  highScore={highScore}
                  onStartGame={startGame}
                  hapticsEnabled={hapticsEnabled}
                  onToggleHaptics={toggleHaptics}
                  soundEnabled={soundEnabled}
                  onToggleSound={toggleSound}
                  showSoundToggle={ENABLE_SOUND_FEATURES_MVP}
                  tapToStartOpacity={tapToStartOpacity}
                  gameOverScale={gameOverScale}
                />
              )}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading Game Area...</ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 20,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    zIndex: 10,
  },
  gameAreaContainer: {
    flex: Platform.OS === "web" ? 0 : 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
