import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import quizData from '../data/words.json';

export default function PronunciationApp() {
  const [index, setIndex] = useState(0);
  const current = quizData[index];

  const handlePress = (choice) => {
    if (choice === current.correct_ipa) {
      Alert.alert("Correct!", "Bien joué!", [
        { text: "Next", onPress: () => setIndex((index + 1) % quizData.length) }
      ]);
    } else {
      Alert.alert("Try again", "Listen closely...");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quel est ce son ?</Text>
      
      <View style={styles.wordContainer}>
        {current.segments.map((s, i) => (
          <Text key={i} style={[styles.wordText, s.underline && styles.underlined]}>
            {s.text}
          </Text>
        ))}
      </View>

      <View style={styles.optionsGrid}>
        {current.options.map((opt) => (
          <TouchableOpacity key={opt} style={styles.btn} onPress={() => handlePress(opt)}>
            <Text style={styles.btnText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  wordContainer: { flexDirection: 'row', marginBottom: 60 },
  wordText: { fontSize: 48 },
  underlined: { textDecorationLine: 'underline', color: '#007AFF', fontWeight: 'bold' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { backgroundColor: '#f0f0f0', padding: 20, margin: 10, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  btnText: { fontSize: 24 }
});