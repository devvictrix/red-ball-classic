// File: components/game/TargetView.tsx

import type { Target } from "@/hooks/useTargets";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface TargetViewProps {
  target: Target;
}

export const TargetView: React.FC<TargetViewProps> = React.memo(
  ({ target }) => {
    const idleAnimation = useSharedValue(1);

    React.useEffect(() => {
      // Gentle idle pulse animation
      idleAnimation.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse on repeat
      );
    }, [idleAnimation]);

    const animatedIdleStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: idleAnimation.value }],
      };
    });

    const animatedHitStyle = useAnimatedStyle(() => {
      if (target.isHitAnimating) {
        return {
          transform: [
            {
              scale: withSequence(
                withTiming(1.3, { duration: 100 }), // Pop bigger
                withTiming(0.9, { duration: 100 }), // Squash
                withTiming(1.1, { duration: 100 }), // Bounce back slightly
                withTiming(1.0, { duration: 100 })
              ),
            },
            {
              rotate: withSequence(
                // Add a little wiggle
                withTiming("10deg", { duration: 75 }),
                withTiming("-10deg", { duration: 150 }),
                withTiming("0deg", { duration: 75 })
              ),
            },
          ],
          opacity: withSequence(
            // Fade slightly
            withTiming(0.6, { duration: 100 }),
            withTiming(1.0, { duration: 200 })
          ),
        };
      }
      // Apply idle scale when not hit animating
      return {
        transform: [{ scale: idleAnimation.value }],
        opacity: 1,
      };
    }, [target.isHitAnimating, idleAnimation.value]); // Depend on idleAnimation.value too

    if (!target.isActive) {
      return null;
    }

    const shadowStyle = Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.15)" },
    });

    return (
      <Animated.View
        style={[
          styles.target,
          shadowStyle,
          {
            left: target.x,
            top: target.y,
            width: target.width,
            height: target.height,
            backgroundColor: target.color,
            borderRadius: target.shape === "circle" ? target.width / 2 : 8,
          },
          animatedHitStyle, // Apply combined hit/idle animation
        ]}
      />
    );
  }
);

const styles = StyleSheet.create({
  target: {
    position: "absolute",
  },
});
