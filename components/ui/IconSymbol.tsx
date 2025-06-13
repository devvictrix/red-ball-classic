// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols'; // SymbolViewProps might not be used here if we only use keys
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Define a type for keys that are valid SF Symbol names used in the app
// This helps ensure that we only try to map symbols we intend to use.
export type MappedIconName =
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  // | 'person.fill' // Example: if you had a profile icon
  | 'gamecontroller.fill' // Icon for the game
  | 'helix'; // Icon for Helix Jump

// Use MappedIconName for the keys of MAPPING
type IconMapping = Record<MappedIconName, ComponentProps<typeof MaterialIcons>['name']>;


/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // 'person.fill': 'person', // Example
  'gamecontroller.fill': 'sports-esports', // Using 'sports-esports' for game controller
  helix: 'rotate-right', // Mapping 'helix' to a suitable Material Icon
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  // weight is not used by MaterialIcons, so it's omitted here but kept for API consistency with IconSymbol.ios.tsx
}: {
  name: MappedIconName; // Use the more specific type
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // Keep for API consistency, though not used by MaterialIcons
}) {
  const materialIconName = MAPPING[name];
  if (!materialIconName) {
    // Fallback or error for unmapped icons
    console.warn(`IconSymbol: No MaterialIcons mapping found for SF Symbol '${name}'. Using default 'error' icon.`);
    return <MaterialIcons color="red" size={size} name="error-outline" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={materialIconName} style={style} />;
}