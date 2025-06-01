// File: hooks/useScore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const HIGH_SCORE_KEY = '@RedBallClassic:highScore'; // Use a distinct key

export function useScore() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const loadHighScore = useCallback(async () => {
    try {
      const storedHighScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    } catch (e) {
      console.warn("Failed to load high score.", e);
    }
  }, []);

  const saveHighScore = useCallback(async (newHighScoreToSave: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, newHighScoreToSave.toString());
    } catch (e) {
      console.warn("Failed to save high score.", e);
    }
  }, []);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  const incrementScoreBy = useCallback((points: number) => {
    setScore((prevScore) => prevScore + points);
  }, []); // setScore is stable

  const resetScore = useCallback(() => {
    setScore(0);
  }, []); // setScore is stable

  const checkAndSaveHighScore = useCallback(() => {
    if (score > highScore) {
      setHighScore(score); // Update state immediately for UI
      saveHighScore(score); // Persist
    }
  }, [score, highScore, saveHighScore]); // Added saveHighScore

  return {
    score,
    highScore,
    incrementScoreBy,
    resetScore,
    checkAndSaveHighScore,
    setHighScore, // Expose if needed for direct manipulation (e.g. testing)
  };
}