// File: hooks/useGameSettings.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

const HAPTICS_ENABLED_KEY = '@RedBallClassic:hapticsEnabled';
const SOUND_ENABLED_KEY = '@RedBallClassic:soundEnabled';
const LOG_PREFIX = "[useGameSettings]";

export function useGameSettings() {
  console.log(`${LOG_PREFIX} Hook initialized/re-rendered.`);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const loadSettings = useCallback(async () => {
    console.log(`${LOG_PREFIX} loadSettings called.`);
    try {
      const storedHaptics = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
      if (storedHaptics !== null) {
        const parsedHaptics = JSON.parse(storedHaptics);
        setHapticsEnabled(parsedHaptics);
        console.log(`${LOG_PREFIX} loadSettings: Haptics loaded: ${parsedHaptics}`);
      } else {
        console.log(`${LOG_PREFIX} loadSettings: No haptics setting found.`);
      }

      const storedSound = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      if (storedSound !== null) {
        const parsedSound = JSON.parse(storedSound);
        setSoundEnabled(parsedSound);
        console.log(`${LOG_PREFIX} loadSettings: Sound loaded: ${parsedSound}`);
      } else {
        console.log(`${LOG_PREFIX} loadSettings: No sound setting found.`);
      }
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed to load game settings.`, e);
    }
  }, []);

  useEffect(() => {
    console.log(`${LOG_PREFIX} useEffect for loadSettings triggered.`);
    loadSettings();
  }, [loadSettings]);

  const saveHapticsSetting = useCallback(async (value: boolean) => {
    console.log(`${LOG_PREFIX} saveHapticsSetting called with value: ${value}`);
    try {
      await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, JSON.stringify(value));
      console.log(`${LOG_PREFIX} saveHapticsSetting: Haptics setting (${value}) saved.`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed to save haptics setting.`, e);
    }
  }, []);

  const saveSoundSetting = useCallback(async (value: boolean) => {
    console.log(`${LOG_PREFIX} saveSoundSetting called with value: ${value}`);
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(value));
      console.log(`${LOG_PREFIX} saveSoundSetting: Sound setting (${value}) saved.`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed to save sound setting.`, e);
    }
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled(prev => {
      const newValue = !prev;
      console.log(`${LOG_PREFIX} toggleHaptics: Previous: ${prev}, New: ${newValue}`);
      saveHapticsSetting(newValue);
      if (newValue) {
        console.log(`${LOG_PREFIX} toggleHaptics: Haptics enabled, triggering feedback.`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return newValue;
    });
  }, [saveHapticsSetting]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      console.log(`${LOG_PREFIX} toggleSound: Previous: ${prev}, New: ${newValue}`);
      saveSoundSetting(newValue);
      if (newValue && hapticsEnabled) { // Check hapticsEnabled state for feedback on sound toggle
        console.log(`${LOG_PREFIX} toggleSound: Sound enabled, triggering UI feedback (if haptics on).`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return newValue;
    });
  }, [saveSoundSetting, hapticsEnabled]); // Added hapticsEnabled dependency

  const triggerHapticFeedback = useCallback((
    type: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationWarning' | 'notificationError'
  ) => {
    // console.log(`${LOG_PREFIX} triggerHapticFeedback called with type: ${type}. Haptics enabled: ${hapticsEnabled}`);
    if (hapticsEnabled) {
      // console.log(`${LOG_PREFIX} triggerHapticFeedback: Triggering ${type}.`);
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

  const playSoundEffect = useCallback((soundName: 'wallHit' | 'paddleHit' | 'brickBreak' | 'gameOver' | 'levelClear' | 'uiClick') => {
    // console.log(`${LOG_PREFIX} playSoundEffect called for: ${soundName}. Sound enabled: ${soundEnabled}`);
    if (soundEnabled) {
      console.log(`${LOG_PREFIX} (Sound Playback - Arcade) Playing: ${soundName}`);
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