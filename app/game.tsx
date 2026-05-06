import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { theme as styles } from '../styles/theme';

// 1. SET THE LIMIT HERE
const WORDS_PER_SESSION = 5;

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; 
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

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
  const { levelIdx } = useLocalSearchParams();
  const currentLevelIdx = parseInt(levelIdx as string) || 0;

  const [wordIdx, setWordIdx] = useState(0);
  const [feedback, setFeedback] = useState({ choice: null, correct: null });
  const [isFinished, setIsFinished] = useState(false);

  const currentRule = practiceRules[currentLevelIdx];

  // Logic to get the subset of words
  const shuffledWords = useMemo(() => {
    const filtered = wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
    // Shuffle and then take only the first 10
    return shuffle(filtered).slice(0, WORDS_PER_SESSION);
  }, [currentLevelIdx]);

  const currentWord = shuffledWords[wordIdx];

  const handlePress = (choice) => {
    if (feedback.choice || isFinished) return;

    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    if (correct) {
      setTimeout(() => {
        // Check against the 10-word limit instead of the full bank
        if (wordIdx + 1 < shuffledWords.length) {
          setWordIdx(prev => prev + 1);
          setFeedback({ choice: null, correct: null });
        } else {
          setIsFinished(true); 
        }
      }, 600);
    } else {
      setTimeout(() => setFeedback({ choice: null, correct: null }), 1000);
    }
  };

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.menuTitle}>Niveau Terminé !</Text>
        <Text style={styles.successSubtitle}>
          Bravo ! Vous avez terminé votre session de 10 mots.
        </Text>
        
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <ArrowLeft color="#2c3e50" size={32} />
        </TouchableOpacity>
      </View>

      {/* 2. UPDATED COUNTER TEXT */}
      <Text style={styles.counterText}>
        Mots: {wordIdx + 1} / {WORDS_PER_SESSION}
      </Text>

      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
      </View>

      <View style={styles.optionsGrid}>
        {currentRule.option_buttons.map((opt) => {
          const isCurrentChoice = feedback.choice === opt;
          return (
            <TouchableOpacity 
              key={opt} 
              style={[
                styles.btn, 
                isCurrentChoice && (feedback.correct ? styles.btnSuccess : styles.btnError)
              ]} 
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

const localStyles = StyleSheet.create({
  header: {
    width: '100%',
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 10,
    paddingLeft: 10,
  },
  backButton: {
    padding: 10,
  }
});