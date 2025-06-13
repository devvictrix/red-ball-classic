import { Canvas } from "@react-three/fiber";
import { StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { GameUI } from "@/components/helix-jump/GameUI";
import { Scene } from "@/components/helix-jump/Scene";
import { HELIX_JUMP_CONFIG } from "@/constants/helixJumpConfig";
import { useHelixGame } from "@/hooks/helix-jump/useHelixGame";

export default function HelixJumpScreen() {
  const game = useHelixGame();
  const { towerRotationY, isGameActive } = game;

  // Gesture handler for tower rotation
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isGameActive) {
        towerRotationY.value +=
          e.velocityX * HELIX_JUMP_CONFIG.INPUT_SENSITIVITY * 0.05;
      }
    })
    .runOnJS(false); // Run on UI thread for smoothness

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <Canvas shadows gl={{ antialias: true }} style={styles.canvas}>
            <Scene game={game} />
          </Canvas>
          <GameUI
            score={game.score}
            level={game.level}
            isGameOver={game.isGameOver}
            isGameActive={game.isGameActive}
            comboStreak={game.comboStreak}
            finalScore={game.finalScore}
            levelMessage={game.levelMessage}
            onRestart={game.handleRestart}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0a1e", // Fallback background
  },
  canvas: {
    flex: 1,
  },
});
