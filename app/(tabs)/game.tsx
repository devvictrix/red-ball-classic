// File: app/(tabs)/game.tsx

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  LayoutChangeEvent,
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
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// ... (Constants remain the same)
const SCREEN_WIDTH = Dimensions.get("window").width;
const WEB_GAME_AREA_WIDTH = 400;
const GAME_ASPECT_RATIO_VALUE = 9 / 14;
interface GameAreaDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}
const BALL_RADIUS = 12;
const INITIAL_BALL_SPEED_X = 2.5;
const INITIAL_BALL_SPEED_Y = -2.5;
const PADDLE_WIDTH = 90;
const PADDLE_HEIGHT = 18;
const PADDLE_Y_OFFSET = 30;
const HIGH_SCORE_KEY = "RedBallClassic_HighScore";
const GAME_FONT_FAMILY = Platform.OS === "ios" ? "SpaceMono" : "monospace";

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

  const gameScreenBackgroundColor = useThemeColor({}, "gameBackground");
  const gameAreaBackgroundColor = useThemeColor({}, "gameAreaBackground");
  const gameAreaBorderColor = useThemeColor({}, "gameBorder");
  const ballColor = useThemeColor({}, "gamePrimary");
  const paddleColor = useThemeColor({}, "gameSecondary");
  const overlayTextColor = useThemeColor({}, "gameText");
  const scoreHeaderColor = useThemeColor({}, "gameAccent");
  const titleColor = useThemeColor({}, "gamePrimary");
  const restartButtonBorderColor = useThemeColor({}, "gameAccent"); // Used for dynamic styling
  const restartButtonTextColor = useThemeColor({}, "gameButtonText");
  const restartButtonBackgroundColor = useThemeColor(
    {},
    "gameButtonBackground"
  );
  const animationFrameId = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);
  const bounceSound = useRef<Audio.Sound | null>(null);
  const gameOverSound = useRef<Audio.Sound | null>(null);
  const soundsLoaded = useRef(false);
  const tapToStartOpacity = useSharedValue(1);
  const gameOverScale = useSharedValue(0);

  useEffect(() => {
    if (!isGameActive && !isGameOver && gameAreaDimensions) {
      tapToStartOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      tapToStartOpacity.value = withTiming(isGameActive || isGameOver ? 0 : 1, {
        duration: 200,
      });
    }
  }, [isGameActive, isGameOver, gameAreaDimensions, tapToStartOpacity]);
  const animatedTapToStartStyle = useAnimatedStyle(() => ({
    opacity: tapToStartOpacity.value,
  }));
  useEffect(() => {
    gameOverScale.value = withTiming(isGameOver ? 1 : 0, {
      duration: isGameOver ? 400 : 200,
    });
  }, [isGameOver, gameOverScale]);
  const animatedGameOverStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverScale.value,
  }));
  const loadHighScore = useCallback(async () => {
    try {
      const hs = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (hs !== null) setHighScore(parseInt(hs, 10));
    } catch (e) {
      console.error("HS Load Err", e);
    }
  }, []);
  const saveHighScore = useCallback(async (newScore: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
      setHighScore(newScore);
    } catch (e) {
      console.error("HS Save Err", e);
    }
  }, []);
  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);
  const updatePaddleCurrentXState = useCallback((newX: number) => {
    setPaddleCurrentX(newX);
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
      } else if (
        nextAppState.match(/inactive|background/) &&
        isGameActive &&
        !isGameOver
      ) {
        paddleOffsetX.value = paddleXShared.value;
        runOnJS(setIsGameActive)(false);
      }
      appState.current = nextAppState;
    });
    return () => sub.remove();
  }, [isGameActive, isGameOver, paddleXShared, paddleOffsetX]);
  const incrementScore = useCallback(() => setScore((s) => s + 1), []);

  const calculateInitialPositions = useCallback(
    (
      dimensions: GameAreaDimensions
    ): {
      ballPos: { x: number; y: number };
      initialPaddleXVisual: number;
      initialPaddleXLogic: number;
    } | null => {
      if (!dimensions) {
        console.warn("[RBC] calculateInitialPositions: no dimensions!");
        return null;
      }
      if (Platform.OS === "web") {
        console.log(
          `[RBC Web Debug] calculateInitialPositions: Using dimensions.width = ${dimensions.width}`
        );
      }
      const ballPos = { x: dimensions.width / 2, y: dimensions.height / 3 };
      const initialPaddleXVisual = dimensions.width / 2 - PADDLE_WIDTH / 2;
      const initialPaddleXLogic = initialPaddleXVisual + PADDLE_WIDTH / 2;
      if (Platform.OS === "web") {
        console.log(
          `[RBC Web Debug] calculateInitialPositions: Calculated initialPVisual=${initialPaddleXVisual}, initialPLogic=${initialPaddleXLogic}`
        );
      }
      return { ballPos, initialPaddleXVisual, initialPaddleXLogic };
    },
    []
  );

  // --- onLayoutGameArea MODIFIED ---
  const onLayoutGameArea = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      if (Platform.OS === "web") {
        console.log(
          `[RBC Web Debug] onLayoutGameArea: Event layout width = ${width}, height = ${height}`
        );
      }
      const currentLayoutDimensions = { x, y, width, height };
      setGameAreaDimensions(currentLayoutDimensions); // Always update state

      if (!hasLayoutBeenSet) {
        // For the first layout, set up React state and initial game state.
        // The actual shared value for paddleXShared for web will be set in the useEffect below.
        const positions = calculateInitialPositions(currentLayoutDimensions);
        if (!positions) return;

        setBallPosition(positions.ballPos);
        setBallVelocity({
          dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED_X,
          dy: INITIAL_BALL_SPEED_Y,
        });
        runOnJS(updatePaddleCurrentXState)(positions.initialPaddleXLogic); // Set logical center
        // paddleXShared.value will be set by the useEffect for web, or directly here for native
        if (Platform.OS !== "web") {
          paddleXShared.value = positions.initialPaddleXVisual;
          paddleOffsetX.value = positions.initialPaddleXVisual;
        }
        paddleScale.value = 1;

        setIsGameActive(false);
        setIsGameOver(false);
        setHasLayoutBeenSet(true); // This will trigger the web-specific useEffect
      } else {
        // Subsequent layouts (e.g., resize)
        if (!isGameActive && !isGameOver) {
          const positions = calculateInitialPositions(currentLayoutDimensions);
          if (!positions) return;
          setBallPosition(positions.ballPos);
          // Re-set paddle shared values directly here for subsequent non-active setups on all platforms
          paddleXShared.value = positions.initialPaddleXVisual;
          paddleOffsetX.value = positions.initialPaddleXVisual;
          runOnJS(updatePaddleCurrentXState)(positions.initialPaddleXLogic);
        }
      }
    },
    [
      hasLayoutBeenSet,
      calculateInitialPositions,
      isGameActive,
      isGameOver,
      updatePaddleCurrentXState,
      paddleXShared, // Added as it's written to
      paddleOffsetX, // Added as it's written to
      paddleScale, // Added as it's written to
    ]
  );

  // --- NEW useEffect for WEB initial paddle position HACK ---
  useEffect(() => {
    if (
      Platform.OS === "web" &&
      hasLayoutBeenSet &&
      gameAreaDimensions &&
      !isGameActive &&
      !isGameOver
    ) {
      // This runs once after the first layout is set and gameAreaDimensions are available.
      const positions = calculateInitialPositions(gameAreaDimensions);
      if (positions) {
        console.log(
          `[RBC Web Debug] useEffect (WEB HACK): Attempting to set paddleXShared.value = ${positions.initialPaddleXVisual} after a frame.`
        );
        // Defer the shared value update slightly
        requestAnimationFrame(() => {
          // rAF is now the globally defined one
          paddleXShared.value = positions.initialPaddleXVisual;
          paddleOffsetX.value = positions.initialPaddleXVisual; // Also set offset
          console.log(
            `[RBC Web Debug] useEffect (WEB HACK): paddleXShared.value is NOW ${paddleXShared.value}`
          );
        });
      }
    }
  }, [
    hasLayoutBeenSet,
    gameAreaDimensions,
    isGameActive,
    isGameOver,
    calculateInitialPositions,
    paddleXShared, // Added as it's written to
    paddleOffsetX, // Added as it's written to
  ]); // Dependencies

  const startGame = useCallback(() => {
    if (gameAreaDimensions) {
      const positions = calculateInitialPositions(gameAreaDimensions);
      if (!positions) return;
      const { ballPos, initialPaddleXVisual, initialPaddleXLogic } = positions;
      setBallPosition(ballPos);
      setBallVelocity({
        dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED_X,
        dy: INITIAL_BALL_SPEED_Y,
      });
      paddleXShared.value = initialPaddleXVisual; // Set directly on start for all platforms
      paddleOffsetX.value = initialPaddleXVisual;
      runOnJS(updatePaddleCurrentXState)(initialPaddleXLogic);
      paddleScale.value = 1;
      setScore(0);
      setIsGameOver(false);
      setIsGameActive(true);
    }
  }, [
    gameAreaDimensions,
    calculateInitialPositions,
    updatePaddleCurrentXState,
    paddleXShared,
    paddleOffsetX,
    paddleScale,
  ]);

  const playSound = useCallback(async (sound: Audio.Sound | null) => {
    if (sound)
      try {
        await sound.replayAsync();
      } catch (e) {
        console.warn("Err play sound", e);
      }
  }, []);
  const handleGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    if (gameOverSound.current) runOnJS(playSound)(gameOverSound.current);
    if (score > highScore) saveHighScore(score);
  }, [score, highScore, saveHighScore, playSound]);
  useEffect(() => {
    const loadSounds = async () => {
      if (soundsLoaded.current) return;
      try {
        if (
          !Audio ||
          !Audio.Sound ||
          typeof Audio.Sound.createAsync !== "function" ||
          !Audio.setAudioModeAsync ||
          !InterruptionModeIOS ||
          !InterruptionModeAndroid
        ) {
          console.error("Audio components missing");
          return;
        }
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
        if (!bounceAsset || !gameOverAsset) {
          console.error("Failed to require sound assets.");
          return;
        }
        const { sound: bounceS } = await Audio.Sound.createAsync(bounceAsset);
        bounceSound.current = bounceS;
        const { sound: gameOverS } = await Audio.Sound.createAsync(
          gameOverAsset
        );
        gameOverSound.current = gameOverS;
        soundsLoaded.current = true;
      } catch (error) {
        console.error("Failed to load sounds", error);
      }
    };
    loadSounds();
    return () => {
      bounceSound.current
        ?.unloadAsync()
        .catch((e) => console.warn("unload b", e));
      gameOverSound.current
        ?.unloadAsync()
        .catch((e) => console.warn("unload go", e));
      soundsLoaded.current = false;
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
      runOnJS(updatePaddleCurrentXState)(clampedX + PADDLE_WIDTH / 2);
    })
    .onEnd(() => {
      if (!gameAreaDimensions) return; // Added safety check
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
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
      return;
    }
    const gameLoop = () => {
      setBallPosition((prevPos) => {
        if (!prevPos || !gameAreaDimensions) return prevPos;
        let newX = prevPos.x + ballVelocity.dx,
          newY = prevPos.y + ballVelocity.dy;
        let newDx = ballVelocity.dx,
          newDy = ballVelocity.dy;
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
        const paddleLeftX_logic = paddleCurrentX - PADDLE_WIDTH / 2;
        const paddleRightX_logic = paddleCurrentX + PADDLE_WIDTH / 2;
        if (
          newDy > 0 &&
          newY + BALL_RADIUS >= paddleTopY &&
          prevPos.y + BALL_RADIUS < paddleTopY &&
          newX + BALL_RADIUS >= paddleLeftX_logic &&
          newX - BALL_RADIUS <= paddleRightX_logic
        ) {
          newY = paddleTopY - BALL_RADIUS;
          newDy = -newDy;
          runOnJS(incrementScore)();
          if (bounceSound.current) runOnJS(playSound)(bounceSound.current);
          paddleScale.value = withSequence(
            withTiming(1.25, { duration: 60 }),
            withTiming(1, { duration: 120 })
          );
          const hitPos = (newX - paddleLeftX_logic) / PADDLE_WIDTH;
          newDx += (hitPos - 0.5) * 2.5;
          newDx = Math.max(
            -Math.abs(INITIAL_BALL_SPEED_X * 1.8),
            Math.min(Math.abs(INITIAL_BALL_SPEED_X * 1.8), newDx)
          );
          if (Math.abs(newDy) < Math.abs(INITIAL_BALL_SPEED_Y * 0.8))
            newDy =
              newDy > 0
                ? Math.abs(INITIAL_BALL_SPEED_Y * 0.8)
                : -Math.abs(INITIAL_BALL_SPEED_Y * 0.8);
        }
        if (newY - BALL_RADIUS > gameAreaDimensions.height) {
          runOnJS(handleGameOver)();
          return prevPos;
        }
        if (newDx !== ballVelocity.dx || newDy !== ballVelocity.dy)
          setBallVelocity({ dx: newDx, dy: newDy });
        return { x: newX, y: newY };
      });
      animationFrameId.current = requestAnimationFrame(gameLoop); // Use imported rAF (now globally defined)
    };
    animationFrameId.current = requestAnimationFrame(gameLoop); // Use imported rAF (now globally defined)
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
    // rAF, // rAF is stable, not needed in deps
  ]);

  const renderGameOverlay = () => {
    if (!gameAreaDimensions || !hasLayoutBeenSet)
      return (
        <ThemedText
          style={[
            styles.gameAreaText,
            { color: overlayTextColor, fontFamily: GAME_FONT_FAMILY },
          ]}
        >
          LOADING ARCADE...
        </ThemedText>
      );
    if (isGameOver)
      return (
        <Animated.View style={[styles.overlayContainer, animatedGameOverStyle]}>
          <ThemedText
            type="title"
            style={[styles.overlayTitleText, { color: ballColor }]}
          >
            GAME OVER
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.overlayInfoText, { color: overlayTextColor }]}
          >
            Final Score: {score}
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.overlayInfoText,
              { color: scoreHeaderColor, marginBottom: 20 },
            ]}
          >
            High Score: {highScore}
          </ThemedText>
          {/* TS ERROR FIX: Dynamic styles for restart button applied here */}
          <TouchableOpacity
            onPress={startGame}
            style={[
              styles.restartButton,
              {
                borderColor: restartButtonBorderColor,
                backgroundColor: restartButtonBackgroundColor,
              },
              Platform.OS === "web"
                ? { boxShadow: `0 0 6px ${restartButtonBorderColor}` }
                : {
                    shadowColor: restartButtonBorderColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 6,
                    elevation: 6,
                  },
            ]}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.restartButtonText,
                { color: restartButtonTextColor },
              ]}
            >
              RESTART
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      );
    if (!isGameActive)
      return (
        <TouchableOpacity
          style={styles.overlayContainer}
          onPress={startGame}
          activeOpacity={0.7}
        >
          <Animated.View style={animatedTapToStartStyle}>
            <ThemedText
              type="title"
              style={[styles.overlayTitleText, { color: overlayTextColor }]}
            >
              TAP TO START
            </ThemedText>
          </Animated.View>
          {highScore > 0 && (
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.overlayInfoText,
                { color: scoreHeaderColor, marginTop: 15 },
              ]}
            >
              High Score: {highScore}
            </ThemedText>
          )}
        </TouchableOpacity>
      );
    return null;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView
        style={[
          styles.screenContainer,
          { backgroundColor: gameScreenBackgroundColor },
        ]}
      >
        <View style={styles.headerContainer}>
          <ThemedText
            type="title"
            style={[styles.title, { color: titleColor }]}
          >
            Red Ball Classic
          </ThemedText>
          {gameAreaDimensions && (isGameActive || isGameOver) && (
            <View style={styles.scoreContainer}>
              <ThemedText
                type="subtitle"
                style={[styles.scoreLabel, { color: scoreHeaderColor }]}
              >
                SCORE:
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.scoreValue, { color: overlayTextColor }]}
              >
                {score}
              </ThemedText>
            </View>
          )}
        </View>
        <View
          style={[
            styles.gameArea,
            {
              borderColor: gameAreaBorderColor,
              backgroundColor: gameAreaBackgroundColor,
              ...(Platform.OS === "web"
                ? { boxShadow: `0 0 8px ${gameAreaBorderColor}` }
                : {
                    shadowColor: gameAreaBorderColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 10,
                  }),
              width:
                Platform.OS === "web"
                  ? WEB_GAME_AREA_WIDTH
                  : gameAreaDimensions?.width || SCREEN_WIDTH - 20,
            },
          ]}
          onLayout={onLayoutGameArea}
          pointerEvents={Platform.OS === "web" ? "box-none" : "auto"}
        >
          {gameAreaDimensions && hasLayoutBeenSet && !isGameOver && (
            <>
              {ballPosition && (
                <View
                  style={[
                    styles.ball,
                    {
                      backgroundColor: ballColor,
                      ...(Platform.OS === "web"
                        ? { boxShadow: `0 0 10px ${ballColor}` }
                        : {
                            shadowColor: ballColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 8,
                          }),
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
                    {
                      backgroundColor: paddleColor,
                      ...(Platform.OS === "web"
                        ? { boxShadow: `0 0 10px ${paddleColor}` }
                        : {
                            shadowColor: paddleColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 8,
                          }),
                      bottom: PADDLE_Y_OFFSET,
                    },
                    animatedPaddleStyle,
                  ]}
                />
              </GestureDetector>
            </>
          )}
          {renderGameOverlay()}
        </View>
        {hasLayoutBeenSet && highScore > 0 && !isGameActive && !isGameOver && (
          <View style={styles.footerHighScoreContainer}>
            <ThemedText
              style={[styles.footerHighScoreText, { color: scoreHeaderColor }]}
            >
              HIGH SCORE: {highScore}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </GestureHandlerRootView>
  );
}

// Styles
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "web" ? 20 : 40,
    paddingHorizontal: 10,
  },
  headerContainer: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? WEB_GAME_AREA_WIDTH + 20 : undefined,
    alignItems: "center",
    marginBottom: 15,
    minHeight: 70,
  },
  title: {
    fontSize: 36,
    fontFamily: GAME_FONT_FAMILY,
    fontWeight: "bold",
    letterSpacing: 1,
    ...(Platform.OS === "web"
      ? { textShadow: `1px 1px 3px rgba(0,0,0,0.5)` }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.5)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }),
  },
  scoreContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreLabel: { fontFamily: GAME_FONT_FAMILY, fontSize: 20, marginRight: 8 },
  scoreValue: {
    fontFamily: GAME_FONT_FAMILY,
    fontSize: 24,
    fontWeight: "bold",
  },
  gameArea: {
    width: Platform.OS === "web" ? WEB_GAME_AREA_WIDTH : SCREEN_WIDTH - 20, // SCREEN_WIDTH here is module-level, consider if it should be dynamic for native if screen can rotate/change
    aspectRatio: GAME_ASPECT_RATIO_VALUE,
    borderWidth: 3,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    maxHeight:
      Platform.OS === "web"
        ? WEB_GAME_AREA_WIDTH / GAME_ASPECT_RATIO_VALUE + 50
        : undefined,
  },
  gameAreaText: { fontSize: 18, textAlign: "center", fontWeight: "bold" },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 20, 0.85)",
    zIndex: 10,
    padding: 20,
  },
  overlayTitleText: {
    fontSize: 32,
    fontFamily: GAME_FONT_FAMILY,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    ...(Platform.OS === "web"
      ? { textShadow: `2px 2px 5px rgba(0,0,0,0.7)` }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.7)",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 5,
        }),
  },
  overlayInfoText: {
    fontSize: 20,
    fontFamily: GAME_FONT_FAMILY,
    textAlign: "center",
    marginVertical: 5,
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
    borderRadius: 5,
  },
  restartButton: {
    // TS ERROR FIX: Removed platform-specific shadows that used component-scope variables
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 25,
  },
  restartButtonText: {
    fontSize: 20,
    fontFamily: GAME_FONT_FAMILY,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footerHighScoreContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    alignSelf: "center",
  },
  footerHighScoreText: {
    fontFamily: GAME_FONT_FAMILY,
    fontSize: 16,
    opacity: 0.7,
  },
});
