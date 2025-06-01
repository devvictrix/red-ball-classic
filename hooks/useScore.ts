// File: hooks/useScore.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const HIGH_SCORE_KEY = '@RedBallClassic:highScore';
const LOG_PREFIX = "[useScore]";

export function useScore() {
  console.log(`${LOG_PREFIX} Hook initialized/re-rendered.`);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const loadHighScore = useCallback(async () => {
    console.log(`${LOG_PREFIX} loadHighScore called.`);
    try {
      const storedHighScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore !== null) {
        const parsedHighScore = parseInt(storedHighScore, 10);
        setHighScore(parsedHighScore);
        console.log(`${LOG_PREFIX} loadHighScore: Found stored high score: ${parsedHighScore}`);
      } else {
        console.log(`${LOG_PREFIX} loadHighScore: No high score found in storage.`);
      }
    } catch (e) {
      console.error(`${LOG_PREFIX} loadHighScore: Failed to load high score.`, e);
    }
  }, []);

  const saveHighScore = useCallback(async (newHighScoreToSave: number) => {
    console.log(`${LOG_PREFIX} saveHighScore called with newHighScoreToSave: ${newHighScoreToSave}`);
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, newHighScoreToSave.toString());
      console.log(`${LOG_PREFIX} saveHighScore: Successfully saved ${newHighScoreToSave}.`);
    } catch (e) {
      console.error(`${LOG_PREFIX} saveHighScore: Failed to save high score.`, e);
    }
  }, []);

  useEffect(() => {
    console.log(`${LOG_PREFIX} useEffect for loadHighScore triggered.`);
    loadHighScore();
  }, [loadHighScore]);

  const incrementScoreBy = useCallback((points: number) => {
    setScore((prevScore) => {
      const newScore = prevScore + points;
      console.log(`${LOG_PREFIX} incrementScoreBy: Adding ${points} points. Prev score: ${prevScore}, New score: ${newScore}`);
      return newScore;
    });
  }, []);

  const resetScore = useCallback(() => {
    console.log(`${LOG_PREFIX} resetScore called.`);
    setScore(0);
  }, []);

  const checkAndSaveHighScore = useCallback(() => {
    console.log(`${LOG_PREFIX} checkAndSaveHighScore called. Current score: ${score}, Current highScore: ${highScore}`);
    if (score > highScore) {
      console.log(`${LOG_PREFIX} checkAndSaveHighScore: New high score! ${score} > ${highScore}. Updating and saving.`);
      setHighScore(score);
      saveHighScore(score);
    } else {
      console.log(`${LOG_PREFIX} checkAndSaveHighScore: Score (${score}) is not greater than highScore (${highScore}). Not saving.`);
    }
  }, [score, highScore, saveHighScore]);

  return {
    score,
    highScore,
    incrementScoreBy,
    resetScore,
    checkAndSaveHighScore,
    setHighScore,
  };
}