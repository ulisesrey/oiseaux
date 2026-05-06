import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';


// --- HELPER FUNCTION (Defined outside to be globally accessible) ---
const renderWord = (word, indices) => {
  if (!indices || indices.length < 2) return <Text style={styles.wordText}>{word}</Text>;
  
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
  
  const activeWords = useMemo(() => {
    return wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
  }, [levelIdx]);

  const currentWord = activeWords[wordIdx];

  const handlePress = (choice) => {
    if (feedback.choice) return; // Ignore clicks during feedback delay

    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    if (correct) {
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % activeWords.length);
        setFeedback({ choice: null, correct: null });
      }, 600); // 600ms is a nice "snappy" transition
    } else {
      setTimeout(() => {
        setFeedback({ choice: null, correct: null });
      }, 1000);
    }
  };

  if (!currentWord) return <View style={styles.container}><Text>Chargement...</Text></View>;

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
              onPress={() => { setLevelIdx(idx); setWordIdx(0); }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  levelTitle: { fontSize: 22, fontWeight: 'bold', position: 'absolute', top: 70, color: '#333' },
  wordContainer: { 
    backgroundColor: '#fff', 
    padding: 40, 
    borderRadius: 30, 
    marginBottom: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10 
  },
  wordText: { fontSize: 56, color: '#1A1A1A' },
  underlined: { textDecorationLine: 'underline', color: '#007AFF', fontWeight: 'bold' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { 
    backgroundColor: '#fff', 
    padding: 20, 
    margin: 10, 
    borderRadius: 20, 
    minWidth: 100, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#DDD' 
  },
  btnSuccess: { backgroundColor: '#4CD964', borderColor: '#4CD964' },
  btnError: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  btnText: { fontSize: 32, fontWeight: '500' },
  whiteText: { color: '#fff' },
  footer: { position: 'absolute', bottom: 40, width: '100%' },
  tabContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  smallBtn: { padding: 8, margin: 4, backgroundColor: '#E1E4E8', borderRadius: 10 },
  smallBtnText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  activeLevel: { backgroundColor: '#007AFF' }
});
