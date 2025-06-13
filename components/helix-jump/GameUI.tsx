import { ThemedText } from '@/components/ThemedText';
import { HELIX_JUMP_CONFIG } from '@/constants/helixJumpConfig';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

type GameUIProps = {
  score: number;
  level: number;
  isGameOver: boolean;
  isGameActive: boolean;
  comboStreak: number;
  finalScore: number;
  levelMessage: string;
  onRestart: () => void;
};

const AnimatedText = Animated.createAnimatedComponent(ThemedText);

export function GameUI({
  score,
  level,
  isGameOver,
  isGameActive,
  comboStreak,
  finalScore,
  levelMessage,
  onRestart,
}: GameUIProps) {
  const scoreScale = useSharedValue(1);
  const levelScale = useSharedValue(1);
  const gameOverOpacity = useSharedValue(0);
  const gameOverScale = useSharedValue(0.9);
  const comboOpacity = useSharedValue(0);
  const comboScale = useSharedValue(1);
  const comboColor = useSharedValue(0); // 0 for normal, 1 for medium, 2 for high, 3 for broken
  const levelMessageOpacity = useSharedValue(0);

  useEffect(() => {
    scoreScale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1));
  }, [score, scoreScale]);

  useEffect(() => {
    levelScale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1));
  }, [level, levelScale]);

  useEffect(() => {
    if (isGameOver) {
      gameOverOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      gameOverScale.value = withDelay(100, withSpring(1));
    } else {
      gameOverOpacity.value = withTiming(0);
      gameOverScale.value = withTiming(0.9);
    }
  }, [isGameOver, gameOverOpacity, gameOverScale]);

  useEffect(() => {
    if (comboStreak > 1) {
      comboOpacity.value = 1;
      comboScale.value = withSequence(withTiming(1.2), withTiming(1));
      if (comboStreak >= HELIX_JUMP_CONFIG.COMBO_THRESHOLD_HIGH) {
        comboColor.value = withTiming(2);
      } else if (comboStreak >= HELIX_JUMP_CONFIG.COMBO_THRESHOLD_MEDIUM) {
        comboColor.value = withTiming(1);
      } else {
        comboColor.value = withTiming(0);
      }
    } else {
      comboOpacity.value = withTiming(0);
    }
  }, [comboStreak, comboColor, comboOpacity, comboScale]);

  useEffect(() => {
    if (levelMessage) {
      levelMessageOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1500, withTiming(0, { duration: 300 }))
      );
    }
  }, [levelMessage, levelMessageOpacity]);

  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const animatedLevelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const animatedGameOverStyle = useAnimatedStyle(() => ({
    opacity: gameOverOpacity.value,
    transform: [{ scale: gameOverScale.value }],
  }));

  const animatedComboStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      comboColor.value,
      [0, 1, 2, 3],
      ['#a5b4fc', '#fde047', '#eab308', '#ef4444']
    );
    return {
      opacity: comboOpacity.value,
      transform: [{ scale: comboScale.value }],
      color,
    };
  });

  const animatedLevelMessageStyle = useAnimatedStyle(() => ({
    opacity: levelMessageOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.topHud}>
        <AnimatedText type="title" style={[styles.gameStat, animatedScoreStyle]}>
          Score: {score}
        </AnimatedText>
        <AnimatedText type="title" style={[styles.gameStat, animatedLevelStyle]}>
          Level: {level}
        </AnimatedText>
      </View>

      <AnimatedText type="subtitle" style={[styles.comboDisplay, animatedComboStyle]}>
        Streak: x{comboStreak}
      </AnimatedText>

      <AnimatedText type="title" style={[styles.levelMessage, animatedLevelMessageStyle]}>
        {levelMessage}
      </AnimatedText>

      {isGameOver && (
        <Animated.View style={[styles.gameOverScreen, animatedGameOverStyle]}>
          <ThemedText type="title" style={styles.gameOverTitle}>
            Game Over
          </ThemedText>
          <ThemedText style={styles.finalScoreText}>Final Score: {finalScore}</ThemedText>
          <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
            <ThemedText style={styles.restartButtonText}>Restart</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}

      {!isGameActive && !isGameOver && (
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsText}>
            Drag to rotate the tower.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  topHud: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 40,
  },
  gameStat: {
    color: '#fcd34d',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontSize: 24,
  },
  comboDisplay: {
    position: 'absolute',
    bottom: 100,
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelMessage: {
    position: 'absolute',
    top: '40%',
    color: '#fcd34d',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameOverScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 10, 30, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff6b6b',
    textShadowColor: '#ff6b6b',
    textShadowRadius: 8,
    marginBottom: 16,
  },
  finalScoreText: {
    fontSize: 20,
    color: '#cbd5e1',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
  },
  instructionsText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});