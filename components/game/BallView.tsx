// File: components/game/BallView.tsx
import { BALL_RADIUS } from '@/constants/gameConstants';
import type { BallPosition } from '@/hooks/useBall';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface BallViewProps {
  position: BallPosition;
}

export const BallView: React.FC<BallViewProps> = React.memo(({ position }) => {
  const ballColor = useThemeColor({}, 'gamePrimary');

  const shadowStyle = Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    android: { elevation: 5 },
    web: { boxShadow: '0px 2px 3px rgba(0,0,0,0.3)' },
  });

  if (position.x === null || position.y === null) return null; // Don't render if not positioned

  return (
    <View
      style={[
        styles.ball,
        shadowStyle,
        {
          left: position.x - BALL_RADIUS,
          top: position.y - BALL_RADIUS,
          backgroundColor: ballColor,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  ball: {
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    position: 'absolute',
  },
});