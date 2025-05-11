// File: app/(tabs)/game.tsx

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Button,
  Dimensions,
  LayoutChangeEvent,
  // --- Add Platform ---
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
// --- Define a specific width for the web game area ---
const WEB_GAME_AREA_WIDTH = 400; // Adjust this value as you see fit (e.g., 360, 450)
const GAME_ASPECT_RATIO_VALUE = 9 / 14;

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

const HIGH_SCORE_KEY = "RedBallClassic_HighScore";

export default function GameScreen() {
  const [gameAreaDimensions, setGameAreaDimensions] =
    useState<GameAreaDimensions | null>(null);
  const [ballPosition, setBallPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [ballVelocity, setBallVelocity] = useState<{ dx: number; dy: number }>({
    dx: INITIAL_BALL_SPEED_X,
    dy: INITIAL_BALL_SPEED_Y,
  });
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hasLayoutBeenSet, setHasLayoutBeenSet] = useState(false);

  const paddleXShared = useSharedValue(0);
  const paddleOffsetX = useSharedValue(0);
  const [paddleCurrentX, setPaddleCurrentX] = useState(0);
  const paddleScale = useSharedValue(1);

  const gameAreaBorderColor = useThemeColor(
    { light: "#333", dark: "#ccc" },
    "text"
  );
  const ballColor = useThemeColor({ light: "red", dark: "orangered" }, "tint");
  const paddleColor = useThemeColor(
    { light: "blue", dark: "royalblue" },
    "tint"
  );
  const overlayTextColor = useThemeColor(
    { light: "black", dark: "white" },
    "text"
  );
  const scoreTextColor = useThemeColor(
    { light: "#11181C", dark: "#ECEDEE" },
    "text"
  );

  const animationFrameId = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  const bounceSound = useRef<Audio.Sound | null>(null);
  const gameOverSound = useRef<Audio.Sound | null>(null);
  const soundsLoaded = useRef(false);

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
    loadHighScore();
  }, [loadHighScore]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
      } else if (
        nextAppState.match(/inactive|background/) &&
        isGameActive &&
        !isGameOver
      ) {
        runOnJS(setIsGameActive)(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isGameActive, isGameOver]);

  const updatePaddleCurrentXState = useCallback((newX: number) => {
    setPaddleCurrentX(newX);
  }, []);

  const incrementScore = useCallback(() => {
    setScore((prevScore) => prevScore + 1);
  }, []);

  const setupInitialPositions = useCallback(
    (currentGamedimensions: GameAreaDimensions) => {
      setBallPosition({
        x: currentGamedimensions.width / 2,
        y: currentGamedimensions.height / 3,
      });
      setBallVelocity({
        dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED_X,
        dy: INITIAL_BALL_SPEED_Y,
      });
      const initialPaddleX = currentGamedimensions.width / 2 - PADDLE_WIDTH / 2;
      paddleXShared.value = initialPaddleX;
      paddleOffsetX.value = initialPaddleX;
      runOnJS(updatePaddleCurrentXState)(initialPaddleX + PADDLE_WIDTH / 2);
      paddleScale.value = 1;
    },
    [paddleXShared, paddleOffsetX, updatePaddleCurrentXState, paddleScale]
  );

  const startGame = useCallback(() => {
    if (gameAreaDimensions) {
      setupInitialPositions(gameAreaDimensions);
      setScore(0);
      setIsGameOver(false);
      setIsGameActive(true);
    }
  }, [gameAreaDimensions, setupInitialPositions]);

  const playSound = useCallback(async (soundObject: Audio.Sound | null) => {
    if (soundObject) {
      try {
        await soundObject.replayAsync();
      } catch (e) {
        console.warn("Error playing sound", e);
      }
    }
  }, []);

  const handleGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    if (gameOverSound.current) runOnJS(playSound)(gameOverSound.current);
    if (score > highScore) {
      saveHighScore(score);
    }
  }, [score, highScore, saveHighScore, playSound]);

  const onLayoutGameArea = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      const currentGamedimensions = { x, y, width, height };
      setGameAreaDimensions(currentGamedimensions);

      if (!hasLayoutBeenSet) {
        const initialPaddleX =
          currentGamedimensions.width / 2 - PADDLE_WIDTH / 2;
        paddleXShared.value = initialPaddleX;
        paddleOffsetX.value = initialPaddleX;
        runOnJS(updatePaddleCurrentXState)(initialPaddleX + PADDLE_WIDTH / 2);

        setupInitialPositions(currentGamedimensions);
        setIsGameActive(false);
        setIsGameOver(false);
        setHasLayoutBeenSet(true);
      }
    },
    [
      setupInitialPositions,
      hasLayoutBeenSet,
      paddleXShared,
      paddleOffsetX,
      updatePaddleCurrentXState,
    ]
  );

  useEffect(() => {
    const loadSounds = async () => {
      if (soundsLoaded.current) return;
      console.log("Attempting to load sounds with expo-av...");

      if (
        !Audio ||
        !Audio.Sound ||
        typeof Audio.Sound.createAsync !== "function" ||
        !Audio.setAudioModeAsync ||
        !InterruptionModeIOS ||
        !InterruptionModeAndroid
      ) {
        console.error(
          "One or more critical Audio components from expo-av are undefined. Check expo-av installation/version and imports."
        );
        if (!Audio)
          console.error("Audio (default import from expo-av) is undefined");
        if (Audio && !Audio.Sound)
          console.error("Audio.Sound (class from expo-av) is undefined");
        if (
          Audio &&
          Audio.Sound &&
          typeof Audio.Sound.createAsync !== "function"
        ) {
          console.error(
            "Audio.Sound.createAsync (static method from expo-av) is undefined or not a function"
          );
        }
        if (Audio && !Audio.setAudioModeAsync)
          console.error(
            "Audio.setAudioModeAsync (static method from expo-av) is undefined"
          );
        if (!InterruptionModeIOS)
          console.error(
            "InterruptionModeIOS (named import from expo-av) is undefined"
          );
        if (!InterruptionModeAndroid)
          console.error(
            "InterruptionModeAndroid (named import from expo-av) is undefined"
          );
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const bounceAsset = require("../../assets/sounds/bounce-8111.mp3");
        const gameOverAsset = require("../../assets/sounds/game-over-arcade-6435.mp3");

        if (!bounceAsset) {
          console.error("Failed to require bounce-8111.mp3");
          return;
        }
        if (!gameOverAsset) {
          console.error("Failed to require game-over-arcade-6435.mp3");
          return;
        }

        const { sound: bounceS } = await Audio.Sound.createAsync(bounceAsset);
        bounceSound.current = bounceS;

        const { sound: gameOverS } = await Audio.Sound.createAsync(
          gameOverAsset
        );
        gameOverSound.current = gameOverS;

        soundsLoaded.current = true;
        console.log("Sounds loaded successfully with expo-av.");
      } catch (error) {
        console.error("Failed to load sounds with expo-av.", error);
      }
    };

    loadSounds();

    return () => {
      if (bounceSound.current) {
        bounceSound.current
          .unloadAsync()
          .catch((e: any) => console.warn("Error unloading bounce sound", e));
      }
      if (gameOverSound.current) {
        gameOverSound.current
          .unloadAsync()
          .catch((e: any) =>
            console.warn("Error unloading game over sound", e)
          );
      }
      soundsLoaded.current = false;
      console.log("Sounds unloaded (expo-av).");
    };
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isGameActive || isGameOver || !gameAreaDimensions) return;
      const newX = paddleOffsetX.value + event.translationX;
      const clampedX = Math.max(
        0,
        Math.min(newX, gameAreaDimensions.width - PADDLE_WIDTH)
      );
      paddleXShared.value = clampedX;
      runOnJS(updatePaddleCurrentXState)(
        paddleXShared.value + PADDLE_WIDTH / 2
      );
    })
    .onEnd(() => {
      if (!isGameActive || isGameOver) return;
      paddleOffsetX.value = paddleXShared.value;
      runOnJS(updatePaddleCurrentXState)(
        paddleXShared.value + PADDLE_WIDTH / 2
      );
    })
    .enabled(isGameActive && !isGameOver);

  const animatedPaddleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: paddleXShared.value },
        { scale: paddleScale.value },
      ],
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
          newY = BALL_RADIUS;
          newDy = -newDy;
          if (bounceSound.current) runOnJS(playSound)(bounceSound.current);
        }
        if (newX - BALL_RADIUS < 0) {
          newX = BALL_RADIUS;
          newDx = -newDx;
          if (bounceSound.current) runOnJS(playSound)(bounceSound.current);
        }
        if (newX + BALL_RADIUS > gameAreaDimensions.width) {
          newX = gameAreaDimensions.width - BALL_RADIUS;
          newDx = -newDx;
          if (bounceSound.current) runOnJS(playSound)(bounceSound.current);
        }

        const paddleTopY =
          gameAreaDimensions.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
        const paddleLeftXGameLogic = paddleCurrentX - PADDLE_WIDTH / 2;
        const paddleRightXGameLogic = paddleCurrentX + PADDLE_WIDTH / 2;

        if (
          newDy > 0 &&
          newY + BALL_RADIUS >= paddleTopY &&
          prevPos.y + BALL_RADIUS < paddleTopY &&
          newX + BALL_RADIUS >= paddleLeftXGameLogic &&
          newX - BALL_RADIUS <= paddleRightXGameLogic
        ) {
          newY = paddleTopY - BALL_RADIUS;
          newDy = -newDy;
          runOnJS(incrementScore)();
          if (bounceSound.current) runOnJS(playSound)(bounceSound.current);
          paddleScale.value = withSequence(
            withTiming(1.2, { duration: 50 }),
            withTiming(1, { duration: 100 })
          );
          const hitPositionOnPaddle =
            (newX - paddleLeftXGameLogic) / PADDLE_WIDTH;
          const influenceFactor = 2;
          newDx += (hitPositionOnPaddle - 0.5) * influenceFactor;
          newDx = Math.max(
            -Math.abs(INITIAL_BALL_SPEED_X * 1.5),
            Math.min(Math.abs(INITIAL_BALL_SPEED_X * 1.5), newDx)
          );
        }

        if (newY - BALL_RADIUS > gameAreaDimensions.height) {
          runOnJS(handleGameOver)();
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
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [
    isGameActive,
    ballPosition,
    ballVelocity,
    gameAreaDimensions,
    paddleCurrentX,
    isGameOver,
    incrementScore,
    paddleScale,
    handleGameOver,
    playSound,
  ]);

  const renderGameOverlay = () => {
    if (!gameAreaDimensions || !hasLayoutBeenSet) {
      return (
        <ThemedText style={styles.gameAreaText}>
          Loading Game Area...
        </ThemedText>
      );
    }
    if (isGameOver) {
      return (
        <View style={styles.overlayContainer}>
          <ThemedText type="title" style={{ color: overlayTextColor }}>
            Game Over
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={{ color: overlayTextColor, marginVertical: 5 }}
          >
            Final Score: {score}
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: overlayTextColor, marginBottom: 10 }}
          >
            High Score: {highScore}
          </ThemedText>
          <Button title="Restart Game" onPress={startGame} />
        </View>
      );
    }
    if (!isGameActive) {
      return (
        <TouchableOpacity
          style={styles.overlayContainer}
          onPress={startGame}
          activeOpacity={0.7}
        >
          <ThemedText type="title" style={{ color: overlayTextColor }}>
            Tap to Start
          </ThemedText>
          {highScore > 0 && (
            <ThemedText
              type="defaultSemiBold"
              style={{ color: overlayTextColor, marginTop: 10 }}
            >
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
            <ThemedText
              type="subtitle"
              style={[styles.scoreText, { color: scoreTextColor }]}
            >
              Score: {score}
            </ThemedText>
          )}
        </View>

        <View
          style={[styles.gameArea, { borderColor: gameAreaBorderColor }]}
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
              <GestureDetector gesture={panGesture}>
                <Animated.View
                  style={[
                    styles.paddleBase,
                    { backgroundColor: paddleColor, bottom: PADDLE_Y_OFFSET },
                    animatedPaddleStyle,
                  ]}
                />
              </GestureDetector>
            </>
          )}
          {renderGameOverlay()}
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center", // Center children horizontally
    justifyContent: "center", // Center children vertically
    paddingTop: Platform.OS === "web" ? 20 : 30, // Slightly less paddingTop for web if needed
    paddingHorizontal: 10,
  },
  headerContainer: {
    width: "100%",
    // --- For web, ensure header doesn't push game area too much if game area is fixed ---
    // You might want to make this position: 'absolute', top: 0 for web,
    // or ensure it's part of the centered content.
    // For simplicity now, let's keep it flow, but adjust if it causes layout issues on web.
    maxWidth: Platform.OS === "web" ? WEB_GAME_AREA_WIDTH : undefined, // Constrain header width on web
    alignItems: "center",
    marginBottom: 10,
    minHeight: 60, // Keep minHeight
  },
  title: {},
  scoreText: { marginTop: 5, fontSize: 20 },
  gameArea: {
    // --- Adjust width based on platform ---
    width: Platform.OS === "web" ? WEB_GAME_AREA_WIDTH : SCREEN_WIDTH - 20,
    aspectRatio: GAME_ASPECT_RATIO_VALUE, // Use the defined aspect ratio
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
    // justifyContent and alignItems for content *inside* gameArea (like the overlay)
    justifyContent: "center",
    alignItems: "center",
    // --- Add a max height for web as a safeguard, though aspectRatio should control it ---
    maxHeight:
      Platform.OS === "web"
        ? WEB_GAME_AREA_WIDTH / GAME_ASPECT_RATIO_VALUE + 50
        : undefined,
  },
  gameAreaText: { fontSize: 16, textAlign: "center" },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  ball: {
    position: "absolute",
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
  },
  paddleBase: {
    position: "absolute",
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  },
});
