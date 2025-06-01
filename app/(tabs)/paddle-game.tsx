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
  GAME_ASPECT_RATIO_VALUE,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_Y_OFFSET,
  SCORE_PER_PADDLE_HIT,
  WEB_GAME_AREA_WIDTH,
} from "@/constants/gameConstants";

const ENABLE_SOUND_FEATURES_MVP = false;
const LOG_PREFIX = "[PaddleGameScreen]";

export default function PaddleGameScreen() {
  console.log(`${LOG_PREFIX} Component rendering/re-rendering.`);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOverState, setIsGameOverState] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [hasGameBeenInitialized, setHasGameBeenInitialized] = useState(false);

  const [gameLevel, setGameLevel] = useState(1);
  const [bricksDestroyedThisLevel, setBricksDestroyedThisLevel] = useState(0);
  const [totalBricksDestroyed, setTotalBricksDestroyed] = useState(0);
  const [displayedSpeed, setDisplayedSpeed] = useState("0.0");

  const appState = useRef(AppState.currentState);
  const animationFrameId = useRef<number | null>(null);
  const gameLoopCounter = useRef(0); // For easier log tracking

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
  } = useScore();
  const {
    hapticsEnabled,
    toggleHaptics,
    triggerHapticFeedback,
    soundEnabled,
    toggleSound,
    playSoundEffect,
  } = useGameSettings();
  const {
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
    console.log(`${LOG_PREFIX} Initialization useEffect triggered. hasLayoutBeenSet: ${hasLayoutBeenSet}, gameAreaDimensions: ${JSON.stringify(gameAreaDimensions)}, hasGameBeenInitialized: ${hasGameBeenInitialized}`);
    if (hasLayoutBeenSet && gameAreaDimensions && !hasGameBeenInitialized) {
      console.log(`${LOG_PREFIX} Performing initial game setup.`);
      const paddleY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
      resetBall(gameAreaDimensions, paddleY, true);
      resetPaddlePosition(gameAreaDimensions);
      initializeBricks(gameAreaDimensions, 0);
      setHasGameBeenInitialized(true);
      tapToStartOpacity.value = 1;
      gameOverScale.value = 0;
      console.log(`${LOG_PREFIX} Initial game setup complete. hasGameBeenInitialized set to true.`);
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
      console.log(`${LOG_PREFIX} startGame called. isNewLevel: ${isNewLevel}. Current score: ${score}, gameLevel: ${gameLevel}`);
      if (!gameAreaDimensions || !hasGameBeenInitialized) {
        console.warn(`${LOG_PREFIX} startGame aborted: gameAreaDimensions or hasGameBeenInitialized is false.`);
        return;
      }
      triggerHapticFeedback("impactMedium");
      playSoundEffect("uiClick");

      let currentScoreForNextLevel = 0;
      if (isNewLevel) {
        currentScoreForNextLevel = score;
        setGameLevel(prevLevel => {
          const nextLevel = prevLevel + 1;
          console.log(`${LOG_PREFIX} startGame: New level. Updating gameLevel to ${nextLevel}`);
          return nextLevel;
        });
      } else {
        console.log(`${LOG_PREFIX} startGame: Fresh start. Resetting score, gameLevel, totalBricksDestroyed.`);
        resetScore();
        setGameLevel(1);
        setTotalBricksDestroyed(0);
      }
      setBricksDestroyedThisLevel(0);
      console.log(`${LOG_PREFIX} startGame: bricksDestroyedThisLevel reset to 0.`);

      const paddleY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
      resetBall(gameAreaDimensions, paddleY, !isNewLevel);
      resetPaddlePosition(gameAreaDimensions);
      resetBricks(gameAreaDimensions, currentScoreForNextLevel);
      setLevelCleared(false);
      setIsGameOverState(false);
      setIsGameActive(true);
      console.log(`${LOG_PREFIX} startGame: Game state updated. isGameActive: true, isGameOverState: false, levelCleared: false.`);
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
      score,
      gameLevel, // Added to dep array due to direct usage in log
      triggerHapticFeedback,
      playSoundEffect,
      tapToStartOpacity,
      gameOverScale,
    ]
  );

  const performLevelCleared = useCallback(() => {
    console.log(`${LOG_PREFIX} performLevelCleared called. Current score: ${score}`);
    setIsGameActive(false);
    setLevelCleared(true);
    setIsGameOverState(false);
    triggerHapticFeedback("notificationSuccess");
    playSoundEffect("levelClear");
    checkAndSaveHighScore();
    console.log(`${LOG_PREFIX} performLevelCleared: Game state updated. isGameActive: false, levelCleared: true.`);
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
    score, // Added to dep array
  ]);

  const performGameOver = useCallback(() => {
    console.log(`${LOG_PREFIX} performGameOver called. Final score: ${score}`);
    setIsGameActive(false);
    setIsGameOverState(true);
    setLevelCleared(false);
    triggerHapticFeedback("notificationError");
    playSoundEffect("gameOver");
    checkAndSaveHighScore();
    console.log(`${LOG_PREFIX} performGameOver: Game state updated. isGameActive: false, isGameOverState: true.`);
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
    score, // Added to dep array
  ]);

  useEffect(() => {
    console.log(`${LOG_PREFIX} Game Loop useEffect triggered. isGameActive: ${isGameActive}, hasLayoutBeenSet: ${hasLayoutBeenSet}`);
    if (!isGameActive || !gameAreaDimensions || !hasLayoutBeenSet) {
      if (animationFrameId.current) {
        console.log(`${LOG_PREFIX} Game Loop: Cancelling animation frame (ID: ${animationFrameId.current}) due to game not active or layout not set.`);
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    gameLoopCounter.current = 0; // Reset counter for new game active session
    const gameLoopLogic = () => {
      gameLoopCounter.current++;
      // console.log(`${LOG_PREFIX} Game Loop Tick #${gameLoopCounter.current}. isGameActive: ${isGameActive}`);

      if (
        !isGameActive ||
        !gameAreaDimensions ||
        !hasLayoutBeenSet ||
        !animationFrameId.current
      ) {
        if (animationFrameId.current) {
          // console.log(`${LOG_PREFIX} Game Loop Tick #${gameLoopCounter.current}: Cancelling animation frame (ID: ${animationFrameId.current}) inside tick due to conditions.`);
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        return;
      }

      // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Ball Pos BEFORE: ${JSON.stringify(ballPosition)}, Vel: ${JSON.stringify(ballVelocity)}`);

      let newX = ballPosition.x + ballVelocity.dx;
      let newY = ballPosition.y + ballVelocity.dy;
      let newVel = { ...ballVelocity };

      // Wall collisions
      if (newX - BALL_RADIUS < 0) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Left Wall Collision. Old newX: ${newX.toFixed(2)}, Old Vel.dx: ${newVel.dx.toFixed(2)}`);
        newVel.dx = -newVel.dx;
        newX = BALL_RADIUS; // Correct position
        triggerHapticFeedback("impactLight");
        playSoundEffect("wallHit");
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Left Wall. New newX: ${newX.toFixed(2)}, New Vel.dx: ${newVel.dx.toFixed(2)}`);
      } else if (newX + BALL_RADIUS > gameAreaDimensions.width) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Right Wall Collision. Old newX: ${newX.toFixed(2)}, Old Vel.dx: ${newVel.dx.toFixed(2)}`);
        newVel.dx = -newVel.dx;
        newX = gameAreaDimensions.width - BALL_RADIUS; // Correct position
        triggerHapticFeedback("impactLight");
        playSoundEffect("wallHit");
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Right Wall. New newX: ${newX.toFixed(2)}, New Vel.dx: ${newVel.dx.toFixed(2)}`);
      }

      if (newY - BALL_RADIUS < 0) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Top Wall Collision. Old newY: ${newY.toFixed(2)}, Old Vel.dy: ${newVel.dy.toFixed(2)}`);
        newVel.dy = -newVel.dy;
        newY = BALL_RADIUS; // Correct position
        triggerHapticFeedback("impactLight");
        playSoundEffect("wallHit");
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Top Wall. New newY: ${newY.toFixed(2)}, New Vel.dy: ${newVel.dy.toFixed(2)}`);
      }

      // Brick collisions
      // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Checking ${bricks.length} bricks for collision.`);
      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (brick.isActive) {
          // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Checking ACTIVE brick ${brick.id}: X:${brick.x.toFixed(1)},Y:${brick.y.toFixed(1)},W:${brick.width.toFixed(1)},H:${brick.height.toFixed(1)}, HitsReq:${brick.hitsRequired}, CurrentHits:${brick.currentHits}`);
          const ballLeft = newX - BALL_RADIUS;
          const ballRight = newX + BALL_RADIUS;
          const ballTop = newY - BALL_RADIUS;
          const ballBottom = newY + BALL_RADIUS;
          const brickLeft = brick.x;
          const brickRight = brick.x + brick.width;
          const brickTop = brick.y;
          const brickBottom = brick.y + brick.height;
          // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} - Ball (L:${ballLeft.toFixed(1)},R:${ballRight.toFixed(1)},T:${ballTop.toFixed(1)},B:${ballBottom.toFixed(1)}), Brick (L:${brickLeft.toFixed(1)},R:${brickRight.toFixed(1)},T:${brickTop.toFixed(1)},B:${brickBottom.toFixed(1)})`);

          if (
            ballRight > brickLeft &&
            ballLeft < brickRight &&
            ballBottom > brickTop &&
            ballTop < brickBottom
          ) {
            // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: GEOMETRIC COLLISION with brick ${brick.id}. Ball at x:${newX.toFixed(1)}, y:${newY.toFixed(1)}`);
            const hitResult = handleBrickHit(brick.id);
            // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: handleBrickHit result for ${brick.id}: ${JSON.stringify(hitResult)}`);
            
            if (hitResult.brickDamaged) {
              // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} DAMAGED. Processing hit.`);
              const overlapX =
                Math.min(ballRight, brickRight) - Math.max(ballLeft, brickLeft);
              const overlapY =
                Math.min(ballBottom, brickBottom) - Math.max(ballTop, brickTop);
              // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} OverlapX: ${overlapX.toFixed(2)}, OverlapY: ${overlapY.toFixed(2)}`);

              if (overlapX < overlapY) {
                newVel.dx = -newVel.dx;
                newX = ballPosition.x > brick.x + brick.width / 2 
                     ? brick.x + brick.width + BALL_RADIUS + 0.1 
                     : brick.x - BALL_RADIUS - 0.1;
                // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} Horizontal Rebound. New Vel.dx: ${newVel.dx.toFixed(2)}, Corrected newX: ${newX.toFixed(2)}`);
              } else {
                newVel.dy = -newVel.dy;
                newY = ballPosition.y > brick.y + brick.height / 2
                     ? brick.y + brick.height + BALL_RADIUS + 0.1
                     : brick.y - BALL_RADIUS - 0.1;
                // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} Vertical Rebound. New Vel.dy: ${newVel.dy.toFixed(2)}, Corrected newY: ${newY.toFixed(2)}`);
              }
              
              if (hitResult.pointsAwarded > 0) {
                // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Awarding ${hitResult.pointsAwarded} points for brick ${brick.id}.`);
                incrementScoreBy(hitResult.pointsAwarded);
              }

              if (hitResult.brickBroken) {
                // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} BROKEN. Incrementing destroy counters.`);
                setBricksDestroyedThisLevel(prev => prev + 1);
                setTotalBricksDestroyed(prev => prev + 1);
                triggerHapticFeedback("impactMedium");
                playSoundEffect("brickBreak");
              } else {
                triggerHapticFeedback("impactLight");
                playSoundEffect("brickBreak"); 
              }
              break; 
            } else {
              // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Brick ${brick.id} NOT damaged by hitResult (was isActive: ${brick.isActive} in current bricks array). This is unexpected if geometric collision occurred with an active brick.`);
            }
          }
        }
      }

      if (allBricksCleared()) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: All bricks cleared. Calling performLevelCleared.`);
        performLevelCleared();
        return; 
      }

      // Paddle collision
      const paddleTopCollisionY =
        gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
      const currentPaddleLeft = paddleXShared.value;
      const currentPaddleRight = paddleXShared.value + PADDLE_WIDTH;
      // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Paddle Check - TopY:${paddleTopCollisionY.toFixed(1)}, L:${currentPaddleLeft.toFixed(1)}, R:${currentPaddleRight.toFixed(1)}`);
      // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Paddle Check - Ball newY+R:${(newY + BALL_RADIUS).toFixed(1)}, Ball oldY+R:${(ballPosition.y + BALL_RADIUS).toFixed(1)}, Ball newX+R:${(newX + BALL_RADIUS).toFixed(1)}, Ball newX-R:${(newX - BALL_RADIUS).toFixed(1)}`);


      if (
        newY + BALL_RADIUS >= paddleTopCollisionY &&
        ballPosition.y + BALL_RADIUS < paddleTopCollisionY && 
        newX + BALL_RADIUS >= currentPaddleLeft &&
        newX - BALL_RADIUS <= currentPaddleRight
      ) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: PADDLE COLLISION DETECTED.`);
        const hitPositionOnPaddle = (newX - currentPaddleLeft) / PADDLE_WIDTH;
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Hit pos on paddle: ${hitPositionOnPaddle.toFixed(2)}. Old vel: ${JSON.stringify(newVel)}`);
        newVel = updateVelocityOnPaddleHit(newVel, hitPositionOnPaddle);
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: New vel after paddle hit: ${JSON.stringify(newVel)}`);
        newY = paddleTopCollisionY - BALL_RADIUS; 
        incrementScoreBy(SCORE_PER_PADDLE_HIT);
        triggerHapticFeedback("impactMedium");
        playSoundEffect("paddleHit");
        triggerPaddleHitAnimation();
      }
      
      const oldVelBeforeDifficulty = {...newVel};
      newVel = increaseDifficulty(score, newVel);
      if (newVel.dx !== oldVelBeforeDifficulty.dx || newVel.dy !== oldVelBeforeDifficulty.dy) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Difficulty increased. Score: ${score}. Old Vel: ${JSON.stringify(oldVelBeforeDifficulty)}, New Vel: ${JSON.stringify(newVel)}`);
      }


      if (newY + BALL_RADIUS > gameAreaDimensions.height + BALL_RADIUS * 2) {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: GAME OVER condition met. Ball Y (${(newY + BALL_RADIUS).toFixed(1)}) > Game Height (${(gameAreaDimensions.height + BALL_RADIUS * 2).toFixed(1)})`);
        performGameOver();
        return; 
      }

      setBallPosition({ x: newX, y: newY });
      setBallVelocity(newVel);
      setDisplayedSpeed(Math.sqrt(newVel.dx ** 2 + newVel.dy ** 2).toFixed(1));
      // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: Ball Pos AFTER: {x: ${newX.toFixed(2)}, y: ${newY.toFixed(2)}}, Vel: {dx: ${newVel.dx.toFixed(2)}, dy: ${newVel.dy.toFixed(2)}}. Speed: ${displayedSpeed}`);


      if (animationFrameId.current) { 
        animationFrameId.current = requestAnimationFrame(gameLoopLogic);
      } else {
        // console.log(`${LOG_PREFIX} Tick #${gameLoopCounter.current}: animationFrameId.current is null, not requesting next frame.`);
      }
    };

    console.log(`${LOG_PREFIX} Game Loop: Starting with requestAnimationFrame.`);
    animationFrameId.current = requestAnimationFrame(gameLoopLogic);
    return () => {
      if (animationFrameId.current) {
        console.log(`${LOG_PREFIX} Game Loop: Cleanup - Cancelling animation frame (ID: ${animationFrameId.current}).`);
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
    paddleXShared, 
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
    displayedSpeed, // Added to dep array as it's used in log
  ]);

  useEffect(() => {
    console.log(`${LOG_PREFIX} AppState listener useEffect setup.`);
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        console.log(`${LOG_PREFIX} AppState changed. Current: ${appState.current}, Next: ${nextAppState}`);
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log(`${LOG_PREFIX} App came to foreground.`);
        } else if (nextAppState.match(/inactive|background/) && isGameActive) {
          console.log(`${LOG_PREFIX} App went to background. Pausing game.`);
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
    return () => {
      console.log(`${LOG_PREFIX} AppState listener removed.`);
      subscription.remove();
    }
  }, [isGameActive, tapToStartOpacity, gameOverScale]);

  // console.log(`${LOG_PREFIX} Rendering UI. isGameActive: ${isGameActive}, isGameOverState: ${isGameOverState}, levelCleared: ${levelCleared}`);
  // console.log(`${LOG_PREFIX} Bricks count for render: ${bricks.length}. Active bricks: ${bricks.filter(b => b.isActive).length}`);


  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: gameBackgroundColor }}
    >
      <ThemedView style={styles.container}>
        <View style={styles.statsBar}>
          <View style={styles.statsColumn}>
            <ThemedText type="defaultSemiBold" style={{ color: scoreTextColor }}>Score: {score}</ThemedText>
            <ThemedText style={{ color: scoreTextColor }}>High: {highScore}</ThemedText>
          </View>
          <View style={styles.statsColumn}>
            <ThemedText type="defaultSemiBold" style={{ color: scoreTextColor }}>Level: {gameLevel}</ThemedText>
            <ThemedText style={{ color: scoreTextColor }}>Speed: {displayedSpeed}</ThemedText>
          </View>
          <View style={styles.statsColumn}>
            <ThemedText type="defaultSemiBold" style={{ color: scoreTextColor }}>B-Hit: {bricksDestroyedThisLevel}</ThemedText>
            <ThemedText style={{ color: scoreTextColor }}>Total: {totalBricksDestroyed}</ThemedText>
          </View>
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
                  gameLevel={gameLevel}
                  totalBricksDestroyed={totalBricksDestroyed}
                />
              )}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading Game Area...</ThemedText>
              {/* {console.log(`${LOG_PREFIX} Rendering Loading Game Area. gameAreaDimensions: ${!!gameAreaDimensions}, hasLayoutBeenSet: ${hasLayoutBeenSet}, hasGameBeenInitialized: ${hasGameBeenInitialized}`)} */}
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
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 10,
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    zIndex: 10,
  },
  statsColumn: {
    alignItems: 'center', 
  },
  gameAreaContainer: {
    flex: Platform.OS === "web" ? 0 : 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});