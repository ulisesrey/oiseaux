import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import { theme as styles } from '../styles/theme';

export default function MainMenu() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.menuTitle}>Choisissez un exercice</Text>
      
      <View style={styles.menuGrid}>
        {practiceRules.map((rule, index) => (
          <TouchableOpacity 
            key={rule.id}
            style={styles.menuCard}
            onPress={() => router.push({
              pathname: "/game",
              params: { levelIdx: index }
            })}
          >
            <Text style={styles.cardId}>{rule.id.toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{rule.title}</Text>
            <View style={styles.soundBadgeContainer}>
              {rule.target_sounds.map(s => (
                <Text key={s} style={styles.soundBadge}>{s}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}