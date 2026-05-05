import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// This now imports the object containing the "levels" array
import dictionary from '../data/words.json';

export default function PronunciationApp() {
  // 1. State for the current level (defaulting to the first one)
  const [levelIndex, setLevelIndex] = useState(0);
  // 2. State for the word index within that level
  const [wordIndex, setWordIndex] = useState(0);

  const currentLevel = dictionary.levels[levelIndex];
  const currentWord = currentLevel.words[wordIndex];

  const handlePress = (choice) => {
    if (choice === currentWord.ipa) {
      // SUCCESS!
      const isLastWord = wordIndex === currentLevel.words.length - 1;

      if (isLastWord) {
        Alert.alert(
          "Level Complete!", 
          `You finished ${currentLevel.title}!`,
          [{ text: "Restart Level", onPress: () => setWordIndex(0) }]
        );
      } else {
        setWordIndex((prev) => prev + 1);
      }
    } else {
      alert("Wrong sound, try again!");
    }
  };

  if (!currentWord) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {/* Show the Level Title */}
      <Text style={styles.levelTitle}>{currentLevel.title}</Text>
      
      <Text style={styles.counter}>
        Word {wordIndex + 1} of {currentLevel.words.length}
      </Text>
      
      <View style={styles.wordContainer}>
        {currentWord.segments.map((s, i) => (
          <Text key={i} style={[styles.wordText, s.underline && styles.underlined]}>
            {s.text}
          </Text>
        ))}
      </View>

      <View style={styles.optionsGrid}>
        {/* We use a Set or a hardcoded list of IPA buttons here, 
            or pull from a global list to keep UI consistent */}
        {["/e/", "/ɛ/", "/a/", "/y/", "/u/", "/ɑ̃/", "/ɛ̃/"].map((opt) => (
          <TouchableOpacity 
            key={opt} 
            style={styles.btn} 
            onPress={() => handlePress(opt)}
          >
            <Text style={styles.btnText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Button to switch levels manually for testing */}
      <TouchableOpacity 
        style={styles.switchBtn} 
        onPress={() => {
            setLevelIndex((levelIndex + 1) % dictionary.levels.length);
            setWordIndex(0);
        }}
      >
        <Text>Next Level →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... styles below ...

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  counter: { position: 'absolute', top: 60, fontSize: 14, color: '#666' },
  instruction: { fontSize: 18, color: '#444', marginBottom: 20 },
  wordContainer: { flexDirection: 'row', marginBottom: 60, backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  wordText: { fontSize: 56, fontWeight: '300' },
  underlined: { textDecorationLine: 'underline', color: '#007AFF', fontWeight: 'bold' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  btn: { backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 30, margin: 10, borderRadius: 16, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  btnText: { fontSize: 28, color: '#333' },
  levelTitle: { 
    position: 'absolute', 
    top: 80, 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#007AFF' 
  },
  switchBtn: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#EEE',
    borderRadius: 8
  },
});