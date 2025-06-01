// File: hooks/useGameSettings.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

const HAPTICS_ENABLED_KEY = '@PlayfulDiscovery:hapticsEnabled';
const SOUND_ENABLED_KEY = '@PlayfulDiscovery:soundEnabled'; // Added for sound

export function useGameSettings() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true); // Added sound state

  // Load Haptics Setting
  const loadHapticsSetting = useCallback(async () => {
    try {
      const storedHapticsEnabled = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
      if (storedHapticsEnabled !== null) {
        setHapticsEnabled(JSON.parse(storedHapticsEnabled));
      }
    } catch (e) {
      console.warn("Failed to load haptics setting.", e);
    }
  }, []);

  // Load Sound Setting
  const loadSoundSetting = useCallback(async () => {
    try {
      const storedSoundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      if (storedSoundEnabled !== null) {
        setSoundEnabled(JSON.parse(storedSoundEnabled));
      }
    } catch (e) {
      console.warn("Failed to load sound setting.", e);
    }
  }, []);

  useEffect(() => {
    loadHapticsSetting();
    loadSoundSetting(); // Load sound setting on mount
  }, [loadHapticsSetting, loadSoundSetting]);

  // Save Haptics Setting
  const saveHapticsSetting = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to save haptics setting.", e);
    }
  }, []);

  // Save Sound Setting
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
      if (newValue || prev) { // Provide feedback for the toggle itself
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return newValue;
    });
  }, [saveHapticsSetting]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      saveSoundSetting(newValue);
      // Optionally play a very soft UI click sound here if sounds were just enabled
      // This requires the sound system to be ready.
      if (newValue && hapticsEnabled) { // Also provide haptic feedback for sound toggle
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return newValue;
    });
  }, [saveSoundSetting, hapticsEnabled]);

  const triggerHapticFeedback = useCallback((
    type: 'impactLight' | 'impactMedium' | 'notificationSuccess' // Simplified types for gentle game
    ) => {
    if (hapticsEnabled) {
      switch (type) {
        case 'impactLight': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'impactMedium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'notificationSuccess': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      }
    }
  }, [hapticsEnabled]);

  // Placeholder for sound playback function
  const playSoundEffect = useCallback((soundName: 'targetHit' | 'paddleTap' | 'uiClick') => {
    if (soundEnabled) {
        // Actual sound playback logic would go here using expo-av
        // e.g., targetHitSound.replayAsync();
        console.log(`(Sound Placeholder) Playing: ${soundName}`);
    }
  }, [soundEnabled]);


  return {
    hapticsEnabled,
    toggleHaptics,
    triggerHapticFeedback,
    soundEnabled, // Expose sound state
    toggleSound,   // Expose sound toggle
    playSoundEffect, // Expose sound playback
  };
}