import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';

export default function PronunciationApp() {
  // 1. Level state
  const [levelIdx, setLevelIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  const currentRule = practiceRules[levelIdx];

  // 2. Filter the word bank to only show words relevant to this level
  // We use useMemo (like a cached view in SQL) so it doesn't re-run every render
  const activeWords = useMemo(() => {
    return wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
  }, [levelIdx]); // Only re-filter when the level changes

  const currentWord = activeWords[wordIdx];

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.levelTitle}>{currentRule.title}</Text>
        <Text>No words found for this level yet!</Text>
        <TouchableOpacity onPress={() => setLevelIdx(0)} style={styles.btn}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePress = (choice) => {
    if (choice === currentWord.target_ipa) {
      // Success: Go to next word in the filtered list
      setWordIdx((prev) => (prev + 1) % activeWords.length);
    } else {
      alert(`Wrong! In "${currentWord.word}", the sound is ${currentWord.target_ipa}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.levelTitle}>{currentRule.title}</Text>
      
      <View style={styles.wordContainer}>
        {currentWord.segments.map((s, i) => (
          <Text key={i} style={[styles.wordText, s.underline && styles.underlined]}>
            {s.text}
          </Text>
        ))}
      </View>

      <View style={styles.optionsGrid}>
        {/* Only show the buttons defined for this specific sound struggle */}
        {currentRule.option_buttons.map((opt) => (
          <TouchableOpacity key={opt} style={styles.btn} onPress={() => handlePress(opt)}>
            <Text style={styles.btnText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Level Selector Interface */}
      <View style={styles.footer}>
        {practiceRules.map((rule, idx) => (
          <TouchableOpacity 
            key={rule.id} 
            onPress={() => { setLevelIdx(idx); setWordIdx(0); }}
            style={[styles.smallBtn, levelIdx === idx && styles.activeLevel]}
          >
            <Text>{rule.id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center' },
  levelTitle: { fontSize: 22, fontWeight: 'bold', position: 'absolute', top: 70 },
  wordContainer: { flexDirection: 'row', marginBottom: 50 },
  wordText: { fontSize: 50 },
  underlined: { textDecorationLine: 'underline', color: '#007AFF' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { backgroundColor: '#fff', padding: 20, margin: 10, borderRadius: 15, minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  btnText: { fontSize: 30 },
  footer: { flexDirection: 'row', position: 'absolute', bottom: 40 },
  smallBtn: { padding: 10, margin: 5, backgroundColor: '#ddd', borderRadius: 5 },
  activeLevel: { backgroundColor: '#007AFF' }
});