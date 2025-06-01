// File: components/game/TargetView.tsx

import type { Target } from '@/hooks/useTargets'; // Will create this hook
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

interface TargetViewProps {
  target: Target;
}

export const TargetView: React.FC<TargetViewProps> = React.memo(({ target }) => {
  if (!target.isActive) {
    return null;
  }

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: { elevation: 3 },
    web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.15)' },
  });

  // Animation for when hit
  const animatedHitStyle = useAnimatedStyle(() => {
    if (target.isHitAnimating) {
      // Example: a gentle pulse
      return {
        transform: [{ scale: withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(1.0, { duration: 150 })
        ) }],
        opacity: withSequence(
            withTiming(0.7, { duration: 150 }),
            withTiming(1.0, { duration: 150 })
        )
      };
    }
    return {
        transform: [{ scale: 1 }],
        opacity: 1,
    };
  }, [target.isHitAnimating]);


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
          borderRadius: target.shape === 'circle' ? target.width / 2 : 8, // Example for circle/square
        },
        animatedHitStyle,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    // Basic styling, more specific styles can be added based on target type
  },
});