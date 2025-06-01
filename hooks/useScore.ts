// File: hooks/useScore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const HIGH_SCORE_KEY = '@PaddleGame:highScore';

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
      console.error("Failed to load high score.", e);
    }
  }, []);

  const saveHighScore = useCallback(async (newHighScore: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
    } catch (e) {
      console.error("Failed to save high score.", e);
    }
  }, []);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  const incrementScoreBy = useCallback((points: number) => {
    setScore((prevScore) => prevScore + points);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  const checkAndSaveHighScore = useCallback(() => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
    }
  }, [score, highScore, saveHighScore]);

  return {
    score,
    highScore,
    incrementScoreBy,
    resetScore,
    checkAndSaveHighScore,
  };
}