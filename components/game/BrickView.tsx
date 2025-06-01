// File: components/game/BrickView.tsx
import type { Brick } from "@/hooks/useBricks"; // Assuming Brick interface is in useBricks.ts
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

interface BrickViewProps {
  brick: Brick;
}

export const BrickView: React.FC<BrickViewProps> = React.memo(({ brick }) => {
  if (!brick.isActive) {
    return null; // Don't render inactive bricks
  }

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    android: { elevation: 2 },
    web: { boxShadow: "0px 1px 2px rgba(0,0,0,0.2)" },
  });

  return (
    <View
      style={[
        styles.brick,
        shadowStyle,
        {
          left: brick.x,
          top: brick.y,
          width: brick.width,
          height: brick.height,
          backgroundColor: brick.color, // Color assigned when bricks are initialized
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  brick: {
    position: "absolute",
    borderRadius: 3, // Slightly rounded corners for bricks
    borderWidth: 0.5, // Thin border for definition
    borderColor: "rgba(0,0,0,0.1)",
  },
});
