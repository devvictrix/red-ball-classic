// File: hooks/useGameSettings.ts (Arcade Version)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

const HAPTICS_ENABLED_KEY = '@RedBallClassic:hapticsEnabled';
const SOUND_ENABLED_KEY = '@RedBallClassic:soundEnabled';

export function useGameSettings() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true); // Default to true for arcade

  const loadSettings = useCallback(async () => {
    try {
      const storedHaptics = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
      if (storedHaptics !== null) setHapticsEnabled(JSON.parse(storedHaptics));

      const storedSound = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      if (storedSound !== null) setSoundEnabled(JSON.parse(storedSound));
    } catch (e) {
      console.warn("Failed to load game settings.", e);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveHapticsSetting = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to save haptics setting.", e);
    }
  }, []);

  const saveSoundSetting = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to save sound setting.", e);
    }
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled(prev => {
      const newValue = !prev;
      saveHapticsSetting(newValue);
      if (newValue) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Feedback for enabling
      return newValue;
    });
  }, [saveHapticsSetting]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      saveSoundSetting(newValue);
      // Optionally play UI click sound if newValue is true and haptics enabled
      if (newValue && hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return newValue;
    });
  }, [saveSoundSetting, hapticsEnabled]);

  const triggerHapticFeedback = useCallback((
    type: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationWarning' | 'notificationError'
    ) => {
    if (hapticsEnabled) {
      switch (type) {
        case 'impactLight': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'impactMedium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'impactHeavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
        case 'notificationSuccess': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
        case 'notificationWarning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
        case 'notificationError': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
      }
    }
  }, [hapticsEnabled]);

  // Placeholder for sound playback
  const playSoundEffect = useCallback((soundName: 'wallHit' | 'paddleHit' | 'brickBreak' | 'gameOver' | 'levelClear' | 'uiClick') => {
    if (soundEnabled) {
        console.log(`(Sound Placeholder - Arcade) Playing: ${soundName}`);
        // Actual sound playback logic using expo-av would go here
    }
  }, [soundEnabled]);

  return {
    hapticsEnabled,
    toggleHaptics,
    triggerHapticFeedback,
    soundEnabled,
    toggleSound,
    playSoundEffect,
  };
}