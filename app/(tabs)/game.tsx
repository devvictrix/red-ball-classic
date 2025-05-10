// File: app/(tabs)/game.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, LayoutChangeEvent, Dimensions, Button, TouchableOpacity, AppState } from 'react-native'; // Added AppState
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface GameAreaDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BALL_RADIUS = 10;
const INITIAL_BALL_SPEED_X = 2.5;
const INITIAL_BALL_SPEED_Y = -2.5;

const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const PADDLE_Y_OFFSET = 30;

const HIGH_SCORE_KEY = 'RedBallClassic_HighScore'; // Key for AsyncStorage

export default function GameScreen() {
  const [gameAreaDimensions, setGameAreaDimensions] =
    useState<GameAreaDimensions | null>(null);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const [ballVelocity, setBallVelocity] = useState<{ dx: number; dy: number }>({
    dx: INITIAL_BALL_SPEED_X,
    dy: INITIAL_BALL_SPEED_Y,
  });
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // New state for high score
  const [hasLayoutBeenSet, setHasLayoutBeenSet] = useState(false);

  const paddleXShared = useSharedValue(0);
  const [paddleCurrentX, setPaddleCurrentX] = useState(0);
  const paddleScale = useSharedValue(1);

  const gameAreaBorderColor = useThemeColor({ light: '#333', dark: '#ccc' }, 'text');
  const ballColor = useThemeColor({light: 'red', dark: 'orangered'}, 'tint');
  const paddleColor = useThemeColor({light: 'blue', dark: 'royalblue'}, 'tint');
  const overlayTextColor = useThemeColor({light: 'black', dark: 'white'}, 'text');
  const scoreTextColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');

  const animationFrameId = useRef<number | null>(null);
  const appState = useRef(AppState.currentState); // For pausing game on background

  // --- High Score Logic ---
  const loadHighScore = useCallback(async () => {
    try {
      const storedHighScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    } catch (e) {
      console.error("Failed to load high score.", e);
    }
  }, []);

  const saveHighScore = useCallback(async (newScore: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
      setHighScore(newScore);
    } catch (e) {
      console.error("Failed to save high score.", e);
    }
  }, []);

  useEffect(() => {
    loadHighScore(); // Load high score on initial mount
  }, [loadHighScore]);
  // --- End High Score Logic ---


  // --- App State Handling (Pause/Resume) ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground - game remains paused unless explicitly resumed
        // For this simple game, we don't auto-resume. User would tap to start again if it was active.
      } else if (nextAppState.match(/inactive|background/) && isGameActive && !isGameOver) {
        // App has gone to the background - Pause the game
        runOnJS(setIsGameActive)(false); // Stop the game loop
        // console.log("Game paused due to app backgrounding");
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isGameActive, isGameOver]); // Re-run if game state changes
  // --- End App State Handling ---


  const updatePaddleCurrentX = useCallback((newX: number) => {
    setPaddleCurrentX(newX);
  }, []);

  const incrementScore = useCallback(() => {
    setScore((prevScore) => prevScore + 1);
  }, []);

  const setupInitialPositions = useCallback((currentGamedimensions: GameAreaDimensions) => {
    setBallPosition({
      x: currentGamedimensions.width / 2,
      y: currentGamedimensions.height / 3,
    });
    setBallVelocity({
      dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED_X,
      dy: INITIAL_BALL_SPEED_Y,
    });
    const initialPaddleX = currentGamedimensions.width / 2;
    paddleXShared.value = initialPaddleX;
    runOnJS(updatePaddleCurrentX)(initialPaddleX);
    paddleScale.value = 1;
  }, [paddleXShared, updatePaddleCurrentX, paddleScale]);

  const startGame = useCallback(() => {
    if (gameAreaDimensions) {
      setupInitialPositions(gameAreaDimensions);
      setScore(0);
      setIsGameOver(false);
      setIsGameActive(true);
    }
  }, [gameAreaDimensions, setupInitialPositions]);

  const handleGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    if (score > highScore) {
      saveHighScore(score);
    }
  }, [score, highScore, saveHighScore]);

  const onLayoutGameArea = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    const currentGamedimensions = { x, y, width, height };
    setGameAreaDimensions(currentGamedimensions);

    if (!hasLayoutBeenSet) {
        setupInitialPositions(currentGamedimensions);
        setIsGameActive(false);
        setIsGameOver(false);
        setHasLayoutBeenSet(true);
    }
  }, [setupInitialPositions, hasLayoutBeenSet]);

  const onPaddlePan = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, context) => {
      if (!isGameActive || isGameOver) return;
      context.startX = paddleXShared.value;
    },
    onActive: (event, context) => {
      if (!isGameActive || isGameOver || !gameAreaDimensions) return;
      let newX = context.startX + event.translationX;
      const minX = PADDLE_WIDTH / 2;
      const maxX = gameAreaDimensions.width - PADDLE_WIDTH / 2;
      paddleXShared.value = Math.max(minX, Math.min(newX, maxX));
      runOnJS(updatePaddleCurrentX)(paddleXShared.value);
    },
    onEnd: () => {
      if (!isGameActive || isGameOver) return;
      runOnJS(updatePaddleCurrentX)(paddleXShared.value);
    },
  });

  const animatedPaddleStyle = useAnimatedStyle(() => {
    return {
      left: paddleXShared.value - PADDLE_WIDTH / 2,
      transform: [{scale: paddleScale.value}]
    };
  });

  useEffect(() => {
    if (!isGameActive || !ballPosition || !gameAreaDimensions || isGameOver) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const gameLoop = () => {
      setBallPosition((prevPos) => {
        if (!prevPos) return null;

        let newX = prevPos.x + ballVelocity.dx;
        let newY = prevPos.y + ballVelocity.dy;
        let newDx = ballVelocity.dx;
        let newDy = ballVelocity.dy;

        if (newY - BALL_RADIUS < 0) {
          newY = BALL_RADIUS; newDy = -newDy;
        }
        if (newX - BALL_RADIUS < 0) {
          newX = BALL_RADIUS; newDx = -newDx;
        }
        if (newX + BALL_RADIUS > gameAreaDimensions.width) {
          newX = gameAreaDimensions.width - BALL_RADIUS; newDx = -newDx;
        }

        const paddleTopY = gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
        const paddleLeftX = paddleCurrentX - PADDLE_WIDTH / 2;
        const paddleRightX = paddleCurrentX + PADDLE_WIDTH / 2;

        if (newDy > 0 && newY + BALL_RADIUS >= paddleTopY && prevPos.y + BALL_RADIUS <= paddleTopY) {
          if (newX + BALL_RADIUS >= paddleLeftX && newX - BALL_RADIUS <= paddleRightX) {
            newY = paddleTopY - BALL_RADIUS; newDy = -newDy;
            runOnJS(incrementScore)();
            paddleScale.value = withSequence(withTiming(1.2, { duration: 50 }), withTiming(1, { duration: 100 }));
            const hitPositionOnPaddle = (newX - paddleLeftX) / PADDLE_WIDTH;
            const influenceFactor = 2;
            newDx += (hitPositionOnPaddle - 0.5) * influenceFactor;
            newDx = Math.max(-Math.abs(INITIAL_BALL_SPEED_X * 1.5), Math.min(Math.abs(INITIAL_BALL_SPEED_X * 1.5), newDx));
          }
        }

        if (newY + BALL_RADIUS > gameAreaDimensions.height + BALL_RADIUS * 2) {
          runOnJS(handleGameOver)(); // Use new handler
          return prevPos;
        }

        if (newDx !== ballVelocity.dx || newDy !== ballVelocity.dy) {
          setBallVelocity({ dx: newDx, dy: newDy });
        }
        return { x: newX, y: newY };
      });
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [
      isGameActive, ballPosition, ballVelocity, gameAreaDimensions, paddleCurrentX,
      isGameOver, incrementScore, paddleScale, handleGameOver // Added handleGameOver
    ]);

  const renderGameOverlay = () => {
    if (!gameAreaDimensions || !hasLayoutBeenSet) {
      return <ThemedText style={styles.gameAreaText}>Loading Game Area...</ThemedText>;
    }
    if (isGameOver) {
      return (
        <View style={styles.overlayContainer}>
          <ThemedText type="title" style={{color: overlayTextColor}}>Game Over</ThemedText>
          <ThemedText type="subtitle" style={{color: overlayTextColor, marginVertical: 5}}>
            Final Score: {score}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={{color: overlayTextColor, marginBottom: 10}}>
            High Score: {highScore}
          </ThemedText>
          <Button title="Restart Game" onPress={startGame} />
        </View>
      );
    }
    if (!isGameActive) {
      return (
        <TouchableOpacity style={styles.overlayContainer} onPress={startGame} activeOpacity={0.7}>
          <ThemedText type="title" style={{color: overlayTextColor}}>Tap to Start</ThemedText>
          {highScore > 0 && ( // Show high score on start screen if it exists
             <ThemedText type="defaultSemiBold" style={{color: overlayTextColor, marginTop: 10}}>
                High Score: {highScore}
             </ThemedText>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.screenContainer}>
        <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.title}>
              Red Ball Classic
            </ThemedText>
            {gameAreaDimensions && isGameActive && !isGameOver && (
                <ThemedText type="subtitle" style={[styles.scoreText, {color: scoreTextColor}]}>
                    Score: {score}
                </ThemedText>
            )}
        </View>

        <View
          style={[
            styles.gameArea,
            { borderColor: gameAreaBorderColor },
          ]}
          onLayout={onLayoutGameArea}
        >
          {gameAreaDimensions && hasLayoutBeenSet && !isGameOver && (
            <>
              {ballPosition && (
                <View
                  style={[
                    styles.ball,
                    {
                      backgroundColor: ballColor,
                      left: ballPosition.x - BALL_RADIUS,
                      top: ballPosition.y - BALL_RADIUS,
                    },
                  ]}
                />
              )}
              <PanGestureHandler onGestureEvent={onPaddlePan}>
                <Animated.View
                  style={[
                    styles.paddle,
                    { backgroundColor: paddleColor },
                    animatedPaddleStyle,
                    { bottom: PADDLE_Y_OFFSET },
                  ]}
                />
              </PanGestureHandler>
            </>
          )}
          {renderGameOverlay()}
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  screenContainer: { flex: 1, alignItems: 'center', paddingTop: 30, paddingHorizontal: 10, },
  headerContainer: { width: '100%', alignItems: 'center', marginBottom: 10, minHeight: 60, },
  title: { },
  scoreText: { marginTop: 5, fontSize: 20, },
  gameArea: { width: SCREEN_WIDTH - 20, aspectRatio: 9 / 14, borderWidth: 2, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center', },
  gameAreaText: { fontSize: 16, textAlign: 'center', },
  overlayContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10, },
  ball: { position: 'absolute', width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, borderRadius: BALL_RADIUS, },
  paddle: { position: 'absolute', width: PADDLE_WIDTH, height: PADDLE_HEIGHT, },
});