// File: components/game/BallView.tsx

import { BALL_RADIUS } from "@/constants/gameConstants";
import type { BallPosition } from "@/hooks/useBall"; // Assuming Sparkle type will be here or in useBall
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

// Define Sparkle type here or import from useBall if moved there
export interface Sparkle {
  id: string;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

interface BallViewProps {
  position: BallPosition;
  sparkles: Sparkle[]; // Add sparkles prop
}

export const BallView: React.FC<BallViewProps> = React.memo(
  ({ position, sparkles }) => {
    const ballColor = useThemeColor({}, "gamePrimary");
    const sparkleColor = useThemeColor({}, "gameAccent"); // Or a dedicated sparkle color

    const shadowStyle = Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0px 2px 3px rgba(0,0,0,0.3)" },
    });

    if (position.x === null || position.y === null) return null;

    return (
      <>
        {/* Render Sparkles */}
        {sparkles.map((sparkle) => (
          <View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: sparkle.x - sparkle.size / 2,
                top: sparkle.y - sparkle.size / 2,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: sparkleColor,
                opacity: sparkle.opacity,
                borderRadius: sparkle.size / 2,
              },
            ]}
          />
        ))}
        {/* Render Ball */}
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
      </>
    );
  }
);

const styles = StyleSheet.create({
  ball: {
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    position: "absolute",
    zIndex: 10, // Ensure ball is above sparkles if they overlap
  },
  sparkle: {
    position: "absolute",
    // backgroundColor will be set dynamically
    // zIndex can be lower than ball if desired
  },
});
