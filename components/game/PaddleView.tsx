// File: components/game/PaddleView.tsx
import { PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET } from '@/constants/gameConstants';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

interface PaddleViewProps {
  panGesture: any; // From react-native-gesture-handler
  animatedStyle: any; // From useAnimatedStyle
}

export const PaddleView: React.FC<PaddleViewProps> = React.memo(({ panGesture, animatedStyle }) => {
  const paddleColor = useThemeColor({}, 'gameSecondary');
  const shadowStyle = Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    android: { elevation: 5 },
    web: { boxShadow: '0px 2px 3px rgba(0,0,0,0.3)' },
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.paddle,
          shadowStyle,
          animatedStyle,
          {
            backgroundColor: paddleColor,
          },
        ]}
      />
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  paddle: {
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    borderRadius: PADDLE_HEIGHT / 2,
    position: 'absolute',
    bottom: PADDLE_Y_OFFSET,
    left: 0, // translateX will move it from this origin
  },
});