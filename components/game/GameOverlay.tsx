// File: components/game/GameOverlay.tsx

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SettingsPanel } from "./SettingsPanel"; // SettingsPanel remains useful

interface GameOverlayProps {
  isGameStarted: boolean; // True if the game is active/playing
  onStartGame: () => void;
  // Settings related props
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  soundEnabled: boolean; // Added for sound
  onToggleSound: () => void; // Added for sound
  // Animation shared values
  overlayOpacity: Animated.SharedValue<number>; // For gentle fade in/out
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  isGameStarted,
  onStartGame,
  hapticsEnabled,
  onToggleHaptics,
  soundEnabled,
  onToggleSound,
  overlayOpacity,
}) => {
  const overlayTextColor = useThemeColor({}, "gameText");
  const buttonBackgroundColor = useThemeColor({}, "gameButtonBackground");
  const buttonTextColor = useThemeColor({}, "gameButtonText");

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Show "Tap to Play" or a simple start screen if game hasn't started
  if (!isGameStarted) {
    return (
      <Animated.View style={[styles.overlay, animatedOverlayStyle, { backgroundColor: "rgba(0,0,0,0.3)"}]}>
        <TouchableOpacity
          onPress={onStartGame}
          activeOpacity={0.7}
          style={styles.playButtonContainer}
        >
          <View style={[styles.playButton, { backgroundColor: buttonBackgroundColor }]}>
            <ThemedText type="title" style={{ color: buttonTextColor }}>
              Play
            </ThemedText>
          </View>
        </TouchableOpacity>
        <SettingsPanel
          hapticsEnabled={hapticsEnabled}
          onToggleHaptics={onToggleHaptics}
          soundEnabled={soundEnabled} // Pass to SettingsPanel
          onToggleSound={onToggleSound} // Pass to SettingsPanel
          // Consider if sound/music flags from roadmap affect rendering of these toggles
          showSoundToggle={true} // Assuming sound flag is true for UI
        />
      </Animated.View>
    );
  }

  // No Game Over or Level Cleared overlays in "Playful Discovery"
  // The overlay might be used for a pause menu in the future.
  return null;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  playButtonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  playButton: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 2px 5px rgba(0,0,0,0.2)" },
    }),
  },
});