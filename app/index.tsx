import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Make sure your path to the JSON is correct!
import quizData from '../data/words.json';

export default function PronunciationApp() {
  const [index, setIndex] = useState(0);
  const current = quizData[index];

  const handlePress = (choice) => {
      console.log("User selected:", choice);
      
      if (choice === current.correct_ipa) {
        console.log("SUCCESS! Moving to next...");
        
        // Use a functional update to ensure we have the latest state
        setIndex((prevIndex) => {
          const next = (prevIndex + 1) % quizData.length;
          return next;
        });

        // Optional: Standard browser alert just for feedback
        // alert("Correct!"); 
      } else {
        console.log("FAIL: Try again");
        alert("Wrong sound, try again!");
      }
    };

  // Guard clause in case data fails to load
  if (!current) return <Text>Loading data...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Word {index + 1} of {quizData.length}</Text>
      
      <View style={styles.wordContainer}>
        {current.segments.map((s, i) => (
          <Text key={i} style={[styles.wordText, s.underline && styles.underlined]}>
            {s.text}
          </Text>
        ))}
      </View>

      <Text style={styles.instruction}>Select the correct IPA sound:</Text>

      <View style={styles.optionsGrid}>
        {current.options.map((opt) => (
          <TouchableOpacity 
            key={opt} 
            style={styles.btn} 
            onPress={() => handlePress(opt)}
          >
            <Text style={styles.btnText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  counter: { position: 'absolute', top: 60, fontSize: 14, color: '#666' },
  instruction: { fontSize: 18, color: '#444', marginBottom: 20 },
  wordContainer: { flexDirection: 'row', marginBottom: 60, backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  wordText: { fontSize: 56, fontWeight: '300' },
  underlined: { textDecorationLine: 'underline', color: '#007AFF', fontWeight: 'bold' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  btn: { backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 30, margin: 10, borderRadius: 16, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  btnText: { fontSize: 28, color: '#333' }
});