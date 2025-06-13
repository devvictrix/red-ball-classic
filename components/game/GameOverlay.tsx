// File: components/game/GameOverlay.tsx

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SettingsPanel } from "./SettingsPanel";

const LOG_PREFIX = "[GameOverlay]";

interface GameOverlayProps {
  isGameOver: boolean;
  levelCleared: boolean;
  score: number;
  highScore: number;
  onStartGame: (isNewLevel: boolean) => void;

  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showSoundToggle: boolean;

  tapToStartOpacity: Animated.SharedValue<number>;
  gameOverScale: Animated.SharedValue<number>;

  gameLevel?: number;
  totalBricksDestroyed?: number;

  // --- DEBUG PROPS ---
  debugBallSpeedDxStr: string;
  setDebugBallSpeedDxStr: (value: string) => void;
  debugBallSpeedDyStr: string;
  setDebugBallSpeedDyStr: (value: string) => void;
  debugBrickTierStr: string;
  setDebugBrickTierStr: (value: string) => void;
}

// Component for a single debug input row for better structure
const DebugInputRow: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: TextInput["props"]["keyboardType"];
  maxLength?: number;
  textColor: string;
  borderColor: string;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  textColor,
  borderColor,
}) => {
  return (
    <View style={styles.debugSettingRow}>
      <ThemedText style={[styles.debugLabel, { color: textColor }]}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.debugInput,
          { borderColor: borderColor, color: textColor },
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={borderColor} // Use border color for placeholder for subtlety
        maxLength={maxLength}
        onSubmitEditing={() =>
          console.log(`${LOG_PREFIX} Debug ${label} submitted: ${value}`)
        }
        returnKeyType="done"
      />
    </View>
  );
};

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
  gameLevel,
  totalBricksDestroyed,
  // --- DEBUG ---
  debugBallSpeedDxStr,
  setDebugBallSpeedDxStr,
  debugBallSpeedDyStr,
  setDebugBallSpeedDyStr,
  debugBrickTierStr,
  setDebugBrickTierStr,
}) => {
  // console.log(`${LOG_PREFIX} Rendering. isGameOver: ${isGameOver}, levelCleared: ${levelCleared}`);
  const overlayTextColor = useThemeColor({}, "gameText");
  const buttonBackgroundColor = useThemeColor({}, "gameButtonBackground");
  const buttonTextColor = useThemeColor({}, "gameButtonText");
  const overlayBackgroundColor = useThemeColor(
    { light: "rgba(200,200,200,0.95)", dark: "rgba(0,0,0,0.95)" }, // Slightly more opaque
    "background"
  );
  const inputBorderColor = useThemeColor(
    { light: "#BDBDBD", dark: "#424242" },
    "gameBorder"
  );
  const inputTextColor = useThemeColor({}, "text");
  const debugSectionBackgroundColor = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.05)" },
    "background" // Use a subtle version of background
  );

  const animatedTapToStartStyle = useAnimatedStyle(() => ({
    opacity: tapToStartOpacity.value,
  }));

  const animatedMessageScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverScale.value > 0 ? 1 : 0,
  }));

  if (isGameOver) {
    // console.log(`${LOG_PREFIX} Rendering Game Over screen.`);
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
          style={{ color: overlayTextColor, marginVertical: 5 }}
        >
          Your Score: {score}
        </ThemedText>
        {typeof gameLevel === "number" && (
          <ThemedText style={{ color: overlayTextColor, fontSize: 16 }}>
            Level Reached: {gameLevel}
          </ThemedText>
        )}
        {typeof totalBricksDestroyed === "number" && (
          <ThemedText
            style={{ color: overlayTextColor, fontSize: 16, marginBottom: 10 }}
          >
            Bricks Smashed: {totalBricksDestroyed}
          </ThemedText>
        )}
        <ThemedText
          type="defaultSemiBold"
          style={{ color: overlayTextColor, marginBottom: 20 }}
        >
          High Score: {highScore}
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            // console.log(`${LOG_PREFIX} "Play Again?" button pressed.`);
            onStartGame(false);
          }}
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
    // console.log(`${LOG_PREFIX} Rendering Level Cleared screen.`);
    return (
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: overlayBackgroundColor },
          animatedMessageScaleStyle,
        ]}
      >
        <ThemedText type="title" style={{ color: overlayTextColor }}>
          Level {gameLevel ? gameLevel - 1 : ""} Cleared!
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={{ color: overlayTextColor, marginVertical: 10 }}
        >
          Score: {score}
        </ThemedText>
        {typeof totalBricksDestroyed === "number" && (
          <ThemedText
            style={{ color: overlayTextColor, fontSize: 16, marginBottom: 10 }}
          >
            Total Smashed: {totalBricksDestroyed}
          </ThemedText>
        )}
        <TouchableOpacity
          onPress={() => {
            // console.log(`${LOG_PREFIX} "Next Level" button pressed.`);
            onStartGame(true);
          }}
          style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        >
          <ThemedText style={{ color: buttonTextColor, fontWeight: "bold" }}>
            Next Level ({gameLevel})
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

  // "Tap to Start" Screen
  if (!isGameOver && !levelCleared) {
    // console.log(`${LOG_PREFIX} Rendering "Tap to Start" screen.`);
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust offset if needed
      >
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: overlayBackgroundColor },
            animatedTapToStartStyle,
          ]}
        >
          <TouchableOpacity // This makes the whole area tappable to start
            onPress={() => {
              // console.log(`${LOG_PREFIX} "Tap to Start" area pressed (main touch target).`);
              onStartGame(false);
            }}
            activeOpacity={1} // Full opacity, as content inside might be interactive
            style={styles.overlayTouchTarget}
          >
            {/* Content Wrapper - to prevent touch from propagating from inputs if needed, though not strictly necessary with current setup */}
            <View
              onStartShouldSetResponder={() => true}
              style={styles.startContent}
            >
              <ThemedText type="title" style={{ color: overlayTextColor }}>
                Red Ball Classic
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={{
                  color: overlayTextColor,
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                Tap to Start
              </ThemedText>

              {/* --- DEBUG SETTINGS UI --- */}
              <View
                style={[
                  styles.debugSettingsContainer,
                  { backgroundColor: debugSectionBackgroundColor },
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    color: overlayTextColor,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Bypass / Debug
                </ThemedText>
                <DebugInputRow
                  label="Ball Speed DX:"
                  value={debugBallSpeedDxStr}
                  onChangeText={setDebugBallSpeedDxStr}
                  placeholder="e.g. 3"
                  keyboardType="numeric"
                  textColor={inputTextColor}
                  borderColor={inputBorderColor}
                />
                <DebugInputRow
                  label="Ball Speed DY:"
                  value={debugBallSpeedDyStr}
                  onChangeText={setDebugBallSpeedDyStr}
                  placeholder="e.g. -4"
                  keyboardType="numeric" // Allows negative
                  textColor={inputTextColor}
                  borderColor={inputBorderColor}
                />
                <DebugInputRow
                  label="Brick Tier (1-3):"
                  value={debugBrickTierStr}
                  onChangeText={(text) =>
                    setDebugBrickTierStr(text.replace(/[^1-3]/g, ""))
                  } // Allow only 1, 2, or 3
                  placeholder="1"
                  keyboardType="number-pad"
                  maxLength={1}
                  textColor={inputTextColor}
                  borderColor={inputBorderColor}
                />
              </View>
              {/* --- END DEBUG SETTINGS UI --- */}

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
      </KeyboardAvoidingView>
    );
  }

  console.error(
    `${LOG_PREFIX} Should not be reached - no overlay condition met!`
  );
  return null;
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },
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
    // Wrapper for all content on start screen
    alignItems: "center",
    width: "100%",
    paddingBottom: 20, // Space for keyboard if it comes up
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    // Shadow styles...
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
  // --- New Debug UI Styles ---
  debugSettingsContainer: {
    width: "90%",
    maxWidth: 340,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20, // Space before general settings panel
    // backgroundColor set by theme color
  },
  debugSettingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 10 : 6, // More padding on iOS for inputs
    width: "100%",
  },
  debugLabel: {
    fontSize: 16,
    flex: 1, // Allow label to take space
  },
  debugInput: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 5,
    fontSize: 16,
    minWidth: 70, // Ensure decent width for input
    maxWidth: 100,
    textAlign: "center",
  },
});
