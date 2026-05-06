import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { theme as styles } from '../styles/theme';

// --- Fisher-Yates Shuffle Helper ---
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

  const shuffledWords = useMemo(() => {
    const filtered = wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
    return shuffle(filtered);
  }, [currentLevelIdx]);

  const currentWord = shuffledWords[wordIdx];

  const handlePress = (choice) => {
    if (feedback.choice || isFinished) return;

    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    if (correct) {
      setTimeout(() => {
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
          Vous avez maîtrisé {shuffledWords.length} mots de "{currentRule.title}"
        </Text>
        
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. HIDE DEFAULT HEADER */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 2. CUSTOM SVG BACK BUTTON */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <ArrowLeft color="#2c3e50" size={32} />
        </TouchableOpacity>
      </View>

      <Text style={styles.counterText}>
        Mots: {wordIdx + 1} / {shuffledWords.length}
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
    top: 40, // Adjusted for status bar clearance
    left: 0,
    zIndex: 10,
    paddingLeft: 10,
  },
  backButton: {
    padding: 10,
  }
});