import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Corrected import syntax
import { theme as styles } from '../styles/theme';

import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';

// --- HELPER FUNCTION ---
const renderWord = (word, indices) => {
  // Defensive check to prevent crashes if indices are missing
  if (!indices || indices.length < 2) {
    return <Text style={styles.wordText}>{word}</Text>;
  }
  
  const [start, end] = indices;
  const prefix = word.substring(0, start);
  const target = word.substring(start, end);
  const suffix = word.substring(end);

  return (
    <Text style={styles.wordText}>
      {prefix}
      <Text style={styles.underlined}>{target}</Text>
      {suffix}
    </Text>
  );
};

export default function PronunciationApp() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  
  // Feedback state for the colors
  const [feedback, setFeedback] = useState({ choice: null, correct: null });

  const currentRule = practiceRules[levelIdx];
  
  // Filter the wordBank based on current level's target sounds
  const activeWords = useMemo(() => {
    return wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
  }, [levelIdx]);

  const currentWord = activeWords[wordIdx];

  const handlePress = (choice) => {
    if (feedback.choice) return; // Prevent double-tapping during feedback

    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    if (correct) {
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % activeWords.length);
        setFeedback({ choice: null, correct: null });
      }, 600); 
    } else {
      setTimeout(() => {
        setFeedback({ choice: null, correct: null });
      }, 1000);
    }
  };

  // Guard clause for loading or missing data
  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.levelTitle}>{currentRule.title}</Text>
      
      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
      </View>

      <View style={styles.optionsGrid}>
        {currentRule.option_buttons.map((opt) => {
          const isCurrentChoice = feedback.choice === opt;
          
          // Construct the dynamic style array
          const buttonStyle = [
            styles.btn,
            isCurrentChoice && feedback.correct === true && styles.btnSuccess,
            isCurrentChoice && feedback.correct === false && styles.btnError,
          ];

          return (
            <TouchableOpacity 
              key={opt} 
              style={buttonStyle} 
              onPress={() => handlePress(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, isCurrentChoice && styles.whiteText]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.tabContainer}>
          {practiceRules.map((rule, idx) => (
            <TouchableOpacity 
              key={rule.id} 
              onPress={() => { 
                setLevelIdx(idx); 
                setWordIdx(0); 
                setFeedback({ choice: null, correct: null }); // Reset feedback on level change
              }}
              style={[styles.smallBtn, levelIdx === idx && styles.activeLevel]}
            >
              <Text style={[styles.smallBtnText, levelIdx === idx && styles.whiteText]}>
                {rule.id.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}