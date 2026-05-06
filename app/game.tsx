import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { theme as styles } from '../styles/theme';

const renderWord = (word, indices) => {
  if (!indices || indices.length < 2) return <Text style={styles.wordText}>{word}</Text>;
  const [start, end] = indices;
  return (
    <Text style={styles.wordText}>
      {word.substring(0, start)}
      <Text style={styles.underlined}>{word.substring(start, end)}</Text>
      {word.substring(end)}
    </Text>
  );
};

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelIdx = parseInt(params.levelIdx as string) || 0;

  const [wordIdx, setWordIdx] = useState(0);
  const [feedback, setFeedback] = useState({ choice: null, correct: null });

  const currentRule = practiceRules[levelIdx];
  const activeWords = useMemo(() => {
    return wordBank.filter(item => currentRule.target_sounds.includes(item.target_ipa));
  }, [levelIdx]);

  const currentWord = activeWords[wordIdx];

  const handlePress = (choice) => {
    if (feedback.choice) return;
    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    if (correct) {
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % activeWords.length);
        setFeedback({ choice: null, correct: null });
      }, 600);
    } else {
      setTimeout(() => setFeedback({ choice: null, correct: null }), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.gameLevelTitle}>{currentRule.title}</Text>

      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
      </View>

      <View style={styles.optionsGrid}>
        {currentRule.option_buttons.map((opt) => {
          const isCurrentChoice = feedback.choice === opt;
          return (
            <TouchableOpacity 
              key={opt} 
              style={[styles.btn, isCurrentChoice && (feedback.correct ? styles.btnSuccess : styles.btnError)]} 
              onPress={() => handlePress(opt)}
            >
              <Text style={[styles.btnText, isCurrentChoice && styles.whiteText]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}