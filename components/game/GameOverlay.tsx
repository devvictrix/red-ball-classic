// File: components/game/GameOverlay.tsx (Arcade Version)
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle
} from "react-native-reanimated";
import { SettingsPanel } from "./SettingsPanel";

interface GameOverlayProps {
  isGameOver: boolean; // True if game over state (ball missed)
  levelCleared: boolean; // True if all bricks are cleared
  score: number;
  highScore: number; // To display on game over
  onStartGame: (isNewLevel: boolean) => void; // Pass if it's a new level or fresh start

  // Settings
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showSoundToggle: boolean; // To control visibility based on feature flag

  // Animations
  tapToStartOpacity: Animated.SharedValue<number>;
  gameOverScale: Animated.SharedValue<number>; // For game over/level cleared message
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  isGameOver,
  levelCleared,
  score,
  highScore,
  onStartGame,
  hapticsEnabled,
  onToggleHaptics,
  soundEnabled,
  onToggleSound,
  showSoundToggle,
  tapToStartOpacity,
  gameOverScale,
}) => {
  const overlayTextColor = useThemeColor({}, "gameText");
  const buttonBackgroundColor = useThemeColor({}, "gameButtonBackground");
  const buttonTextColor = useThemeColor({}, "gameButtonText");
  const overlayBackgroundColor = useThemeColor(
    { light: "rgba(200,200,200,0.7)", dark: "rgba(0,0,0,0.7)" },
    "background"
  );

  const animatedTapToStartStyle = useAnimatedStyle(() => ({
    opacity: tapToStartOpacity.value,
  }));

  const animatedMessageScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverScale.value > 0 ? 1 : 0, // Ensure opacity is 0 if scale is 0
  }));

  if (isGameOver) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: overlayBackgroundColor },
          animatedMessageScaleStyle,
        ]}
      >
        <ThemedText type="title" style={{ color: overlayTextColor }}>
          Game Over
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={{ color: overlayTextColor, marginVertical: 10 }}
        >
          Your Score: {score}
        </ThemedText>
        <ThemedText
          type="defaultSemiBold"
          style={{ color: overlayTextColor, marginBottom: 20 }}
        >
          High Score: {highScore}
        </ThemedText>
        <TouchableOpacity
          onPress={() => onStartGame(false)} // false for not a new level (fresh start)
          style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        >
          <ThemedText style={{ color: buttonTextColor, fontWeight: "bold" }}>
            Play Again?
          </ThemedText>
        </TouchableOpacity>
        <SettingsPanel
          hapticsEnabled={hapticsEnabled}
          onToggleHaptics={onToggleHaptics}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          showSoundToggle={showSoundToggle}
        />
      </Animated.View>
    );
  }

  if (levelCleared) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: overlayBackgroundColor },
          animatedMessageScaleStyle,
        ]}
      >
        <ThemedText type="title" style={{ color: overlayTextColor }}>
          Level Cleared!
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={{ color: overlayTextColor, marginVertical: 10 }}
        >
          Score: {score}
        </ThemedText>
        <TouchableOpacity
          onPress={() => onStartGame(true)} // true for starting a new level
          style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        >
          <ThemedText style={{ color: buttonTextColor, fontWeight: "bold" }}>
            Next Level
          </ThemedText>
        </TouchableOpacity>
        <SettingsPanel
          hapticsEnabled={hapticsEnabled}
          onToggleHaptics={onToggleHaptics}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          showSoundToggle={showSoundToggle}
        />
      </Animated.View>
    );
  }

  // Show "Tap to Start" if game is not active, not game over, and not level cleared
  // This implies initial state or after returning from background
  if (!isGameOver && !levelCleared) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: overlayBackgroundColor },
          animatedTapToStartStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => onStartGame(false)}
          activeOpacity={0.7}
          style={styles.overlayTouchTarget} // Make entire overlay touchable
        >
          <View style={styles.startContent}>
            <ThemedText type="title" style={{ color: overlayTextColor }}>
              Red Ball Classic
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={{
                color: overlayTextColor,
                marginTop: 10,
                marginBottom: 30,
              }}
            >
              Tap to Start
            </ThemedText>
            <SettingsPanel
              hapticsEnabled={hapticsEnabled}
              onToggleHaptics={onToggleHaptics}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              showSoundToggle={showSoundToggle}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return null; // Should not be reached if one of the above conditions is met
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayTouchTarget: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  startContent: {
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" },
    }),
  },
});
