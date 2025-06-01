// File: components/game/SettingsPanel.tsx

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface SettingsSwitchProps {
  label: string;
  value: boolean;
  onValueChange: () => void;
  textColor: string;
  thumbColor?: string;
  trackColor?: { false: string; true: string };
}

const SingleSettingSwitch: React.FC<SettingsSwitchProps> = ({ label, value, onValueChange, textColor, thumbColor, trackColor }) => (
  <View style={styles.settingRow}>
    <ThemedText style={{ color: textColor, marginRight: 10, fontSize: 18 }}>{label}</ThemedText>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={thumbColor}
      trackColor={trackColor}
      ios_backgroundColor={trackColor?.false}
    />
  </View>
);

interface SettingsPanelProps {
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showSoundToggle: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  hapticsEnabled,
  onToggleHaptics,
  soundEnabled,
  onToggleSound,
  showSoundToggle,
}) => {
  const settingsTextColor = useThemeColor({}, 'gameText');
  const switchThumbColorOn = useThemeColor({}, 'gameAccent');
  // Corrected useThemeColor calls:
  const switchThumbColorOff = useThemeColor({ light: '#E0E0E0', dark: '#505050'}, 'background');
  const switchTrackColor = {
    false: useThemeColor({ light: '#BDBDBD', dark: '#424242' }, 'gameBorder'),
    true: useThemeColor({ light: '#A5D6A7', dark: '#81C784' }, 'gameSecondary'),
  };

  return (
    <View style={styles.settingsContainer}>
      <SingleSettingSwitch
        label="Feel Taps"
        value={hapticsEnabled}
        onValueChange={onToggleHaptics}
        textColor={settingsTextColor}
        thumbColor={hapticsEnabled ? switchThumbColorOn : switchThumbColorOff}
        trackColor={switchTrackColor}
      />
      {showSoundToggle && (
        <SingleSettingSwitch
          label="Sounds"
          value={soundEnabled}
          onValueChange={onToggleSound}
          textColor={settingsTextColor}
          thumbColor={soundEnabled ? switchThumbColorOn : switchThumbColorOff}
          trackColor={switchTrackColor}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    width: '90%',
    maxWidth: 320,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});