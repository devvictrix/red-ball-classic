// File: app/(tabs)/paddle-game.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  StyleSheet,
  View,
  type AppStateStatus,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated'; // Removed unused useAnimatedStyle, Easing for now

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// Corrected import for background colors: from '@/constants/Colors'
import { gentleBackgroundColorsDark, gentleBackgroundColorsLight } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';


import { useBall } from '@/hooks/useBall';
import { useGameDimensions } from '@/hooks/useGameDimensions';
import { useGameSettings } from '@/hooks/useGameSettings';
import { usePaddle } from '@/hooks/usePaddle';
import { useTargets } from '@/hooks/useTargets';

import { BallView } from '@/components/game/BallView';
import { GameOverlay } from '@/components/game/GameOverlay';
import { PaddleView } from '@/components/game/PaddleView';
import { TargetView } from '@/components/game/TargetView';

import {
  BALL_RADIUS,
  GAME_ASPECT_RATIO_VALUE,
  PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET,
  TARGET_HITS_FOR_BACKGROUND_CHANGE, TARGET_HITS_FOR_SPARKLE_TRAIL,
  WEB_GAME_AREA_WIDTH
} from '@/constants/gameConstants';
import { useColorScheme } from '@/hooks/useColorScheme';


const ENABLE_SOUND_FEATURES_MVP = false;

export default function PaddleGameScreen() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [hasGameBeenInitialized, setHasGameBeenInitialized] = useState(false);
  const [totalTargetHits, setTotalTargetHits] = useState(0);
  const [currentBgColorIndex, setCurrentBgColorIndex] = useState(0);

  const appState = useRef(AppState.currentState);
  const animationFrameId = useRef<number | null>(null);
  const colorScheme = useColorScheme() ?? 'light'; // Ensure not undefined

  const { gameAreaDimensions, hasLayoutBeenSet, handleLayout } = useGameDimensions();
  const {
    ballPosition, setBallPosition,
    ballVelocity, setBallVelocity,
    isBallVisible, setIsBallVisible,
    sparkles, activateSparkleTrail,
    resetBall, updateVelocityOnPaddleHit,
  } = useBall();
  const {
    hapticsEnabled, toggleHaptics, triggerHapticFeedback,
    soundEnabled, toggleSound, playSoundEffect,
  } = useGameSettings();
  const {
    paddleCurrentLogicalX, animatedPaddleStyle, panGesture,
    resetPaddle: resetPaddlePosition, triggerPaddleGentleSquash,
  } = usePaddle(gameAreaDimensions, isGameActive);
  const { targets, initializeTargets, handleTargetHit, resetTargets } = useTargets();

  const overlayOpacity = useSharedValue(1);
  // const gameAreaBgSharedValue = useSharedValue(0); // Not used for direct state update for BG

  const currentBgColors = colorScheme === 'dark' ? gentleBackgroundColorsDark : gentleBackgroundColorsLight;
  const initialGameAreaBg = useThemeColor({}, 'gameAreaBackground');
  const [gameAreaCurrentBg, setGameAreaCurrentBg] = useState(initialGameAreaBg);


  useEffect(() => {
    const newColor = currentBgColors[currentBgColorIndex % currentBgColors.length];
    setGameAreaCurrentBg(newColor);
  }, [currentBgColorIndex, colorScheme, currentBgColors]);


  useEffect(() => {
    if (hasLayoutBeenSet && gameAreaDimensions && !hasGameBeenInitialized) {
      const paddleY = gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
      resetBall(gameAreaDimensions, paddleY);
      resetPaddlePosition(gameAreaDimensions);
      initializeTargets(gameAreaDimensions);
      setIsBallVisible(false);
      setHasGameBeenInitialized(true);
      // Set initial BG color directly based on the current theme's first gentle color
      setGameAreaCurrentBg(colorScheme === 'dark' ? gentleBackgroundColorsDark[0] : gentleBackgroundColorsLight[0]);
    }
  }, [hasLayoutBeenSet, gameAreaDimensions, resetBall, resetPaddlePosition, initializeTargets, setIsBallVisible, hasGameBeenInitialized, colorScheme]);

  const startGame = useCallback(() => {
    if (!gameAreaDimensions || !hasGameBeenInitialized) return;
    triggerHapticFeedback('impactMedium');
    playSoundEffect('uiClick');

    const paddleY = gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
    resetBall(gameAreaDimensions, paddleY);
    resetPaddlePosition(gameAreaDimensions);
    resetTargets(gameAreaDimensions);
    setTotalTargetHits(0);
    setCurrentBgColorIndex(0);
    // Reset BG color to the initial one for the current theme
    setGameAreaCurrentBg(colorScheme === 'dark' ? gentleBackgroundColorsDark[0] : gentleBackgroundColorsLight[0]);


    setIsGameActive(true);
    setIsBallVisible(true);
    overlayOpacity.value = withTiming(0, { duration: 300 });
  }, [
    gameAreaDimensions, hasGameBeenInitialized,
    resetBall, resetPaddlePosition, resetTargets,
    triggerHapticFeedback, playSoundEffect, setIsBallVisible, overlayOpacity,
    colorScheme
  ]);

  useEffect(() => {
    if (!isGameActive || !gameAreaDimensions || !hasLayoutBeenSet || !isBallVisible) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const gameLoopLogic = () => {
      if (!isGameActive || !gameAreaDimensions || !hasLayoutBeenSet || !isBallVisible || !animationFrameId.current) {
        if (animationFrameId.current) { cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; }
        return;
      }

      let newX = ballPosition.x + ballVelocity.dx;
      let newY = ballPosition.y + ballVelocity.dy;
      let newVel = { ...ballVelocity };

      if (newX - BALL_RADIUS < 0 || newX + BALL_RADIUS > gameAreaDimensions.width) {
        newVel.dx = -newVel.dx; newX = ballPosition.x + newVel.dx;
        triggerHapticFeedback('impactLight'); playSoundEffect('paddleTap');
      }
      if (newY - BALL_RADIUS < 0) {
        newVel.dy = -newVel.dy; newY = ballPosition.y + newVel.dy;
        triggerHapticFeedback('impactLight'); playSoundEffect('paddleTap');
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if (target.isActive) {
          const ballCenterX = newX; const ballCenterY = newY;
          const closestX = Math.max(target.x, Math.min(ballCenterX, target.x + target.width));
          const closestY = Math.max(target.y, Math.min(ballCenterY, target.y + target.height));
          const distanceX = ballCenterX - closestX; const distanceY = ballCenterY - closestY;
          const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

          if (distanceSquared < (BALL_RADIUS * BALL_RADIUS)) {
            const hitResult = handleTargetHit(target.id);
            if (hitResult.targetHit) {
              triggerHapticFeedback('notificationSuccess'); playSoundEffect('targetHit');

              setTotalTargetHits(prev => {
                const nextTotalHits = prev + 1;
                if (nextTotalHits % TARGET_HITS_FOR_BACKGROUND_CHANGE === 0 && nextTotalHits > 0) {
                    setCurrentBgColorIndex(idx => idx + 1);
                }
                if (nextTotalHits % TARGET_HITS_FOR_SPARKLE_TRAIL === 0 && nextTotalHits > 0) {
                    activateSparkleTrail();
                }
                return nextTotalHits;
              });

              const prevBallLeft = ballPosition.x - BALL_RADIUS; const prevBallRight = ballPosition.x + BALL_RADIUS;
              const prevBallTop = ballPosition.y - BALL_RADIUS; const prevBallBottom = ballPosition.y + BALL_RADIUS;
              let collidedFromSide = false; let collidedFromTopBottom = false;
              if ((prevBallRight <= target.x && newX + BALL_RADIUS >= target.x) || (prevBallLeft >= target.x + target.width && newX - BALL_RADIUS <= target.x + target.width)) { collidedFromSide = true; }
              if ((prevBallBottom <= target.y && newY + BALL_RADIUS >= target.y) || (prevBallTop >= target.y + target.height && newY - BALL_RADIUS <= target.y + target.height)) { collidedFromTopBottom = true; }
              if (collidedFromSide && !collidedFromTopBottom) { newVel.dx = -newVel.dx; }
              else if (collidedFromTopBottom && !collidedFromSide) { newVel.dy = -newVel.dy; }
              else { newVel.dy = -newVel.dy; }
              newX = ballPosition.x + newVel.dx; newY = ballPosition.y + newVel.dy;
            }
            break;
          }
        }
      }

      const paddleTopCollisionY = gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
      const paddleLeftLogicalX = paddleCurrentLogicalX - PADDLE_WIDTH / 2;
      const paddleRightLogicalX = paddleCurrentLogicalX + PADDLE_WIDTH / 2;

      if (newY + BALL_RADIUS >= paddleTopCollisionY && ballPosition.y + BALL_RADIUS < paddleTopCollisionY &&
          newX + BALL_RADIUS >= paddleLeftLogicalX && newX - BALL_RADIUS <= paddleRightLogicalX) {
        newVel = updateVelocityOnPaddleHit(newVel); newY = paddleTopCollisionY - BALL_RADIUS;
        triggerHapticFeedback('impactMedium'); playSoundEffect('paddleTap'); triggerPaddleGentleSquash();
      }

      if (newY - BALL_RADIUS > gameAreaDimensions.height) {
        triggerHapticFeedback('impactLight'); playSoundEffect('uiClick');
        const paddleYPos = gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2;
        resetBall(gameAreaDimensions, paddleYPos);
        return;
      }

      setBallPosition({ x: newX, y: newY });
      setBallVelocity(newVel);

      if (animationFrameId.current) { animationFrameId.current = requestAnimationFrame(gameLoopLogic); }
    };
    animationFrameId.current = requestAnimationFrame(gameLoopLogic);
    return () => { if (animationFrameId.current) { cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; } };
  }, [
    isGameActive, gameAreaDimensions, hasLayoutBeenSet, isBallVisible,
    ballPosition, ballVelocity, setBallPosition, setBallVelocity,
    paddleCurrentLogicalX, targets, handleTargetHit,
    updateVelocityOnPaddleHit, triggerPaddleGentleSquash,
    triggerHapticFeedback, playSoundEffect, resetBall,
    BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET,
    activateSparkleTrail
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') { /* ... */ }
      else if (nextAppState.match(/inactive|background/) && isGameActive) {
        setIsGameActive(false); setIsBallVisible(false);
        overlayOpacity.value = withTiming(1, { duration: 100 });
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isGameActive, overlayOpacity, setIsGameActive, setIsBallVisible]);

  const gameAppBackgroundColor = useThemeColor({}, 'gameBackground'); // Renamed to avoid conflict
  const borderColor = useThemeColor({}, 'gameBorder');


  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: gameAppBackgroundColor }}>
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.gameAreaContainer,
            Platform.OS === 'web' && { width: WEB_GAME_AREA_WIDTH, height: WEB_GAME_AREA_WIDTH / GAME_ASPECT_RATIO_VALUE, alignSelf: 'center' }
          ]}
          onLayout={handleLayout}
        >
          {gameAreaDimensions && hasLayoutBeenSet && hasGameBeenInitialized ? (
            <View style={{ width: gameAreaDimensions.width, height: gameAreaDimensions.height, backgroundColor: gameAreaCurrentBg, borderColor: borderColor, borderWidth: 2, overflow: 'hidden' }}>
              {targets.map(target => (
                <TargetView key={target.id} target={target} />
              ))}
              {isBallVisible && <BallView position={ballPosition} sparkles={sparkles} />}
              <PaddleView panGesture={panGesture} animatedStyle={animatedPaddleStyle} />

              {(!isGameActive && hasGameBeenInitialized) && (
                <GameOverlay
                  isGameStarted={isGameActive}
                  onStartGame={startGame}
                  hapticsEnabled={hapticsEnabled}
                  onToggleHaptics={toggleHaptics}
                  soundEnabled={soundEnabled}
                  onToggleSound={toggleSound}
                  overlayOpacity={overlayOpacity}
                />
              )}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading Play Area...</ThemedText>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 10 : 30,
    paddingBottom: 10,
  },
  gameAreaContainer: {
    flex: Platform.OS === 'web' ? 0 : 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});