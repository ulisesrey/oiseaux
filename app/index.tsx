import { useFocusEffect, useRouter } from 'expo-router';
import { Flame, Heart, Star } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import { layoutStyles } from '../styles/layout';
import { theme as styles } from '../styles/theme';
import { getUserStats, UserStats } from '../utils/storage';

export default function MainMenu() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  // Reusable function to fetch data from storage
  const loadStats = async () => {
    const data = await getUserStats();
    setStats(data);
  };

  // useFocusEffect runs EVERY time you navigate back to this screen
  useFocusEffect(
    useCallback(() => {
      loadStats();
      
      // Optional: Polling every 10 seconds while on this screen 
      // to catch time-based heart refills automatically
      const interval = setInterval(loadStats, 10000);
      
      return () => clearInterval(interval); 
    }, [])
  );

  if (!stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* --- GAMIFIED HEADER --- */}
      <View style={layoutStyles.headerContainer}>
        {/* Streak Item */}
        <View style={layoutStyles.statItem}>
          <Flame color="#FF4B4B" size={20} fill="#FF4B4B" />
          <Text style={layoutStyles.statText}>4</Text> 
        </View>

        {/* Stars Item (Dark) */}
        <View style={[layoutStyles.statItem, layoutStyles.starBg]}>
          <Star color="#FFD700" size={20} fill="#FFD700" />
          <Text style={[layoutStyles.statText, layoutStyles.whiteText]}>
            {stats.stars.toLocaleString()}
          </Text>
        </View>

        {/* Lives Item */}
        <View style={layoutStyles.statItem}>
          <Heart color="#FF4B4B" size={20} fill="#FF4B4B" />
          <Text style={layoutStyles.statText}>{stats.lives}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.menuTitle}>Choisissez un exercice</Text>
        
        <View style={styles.menuGrid}>
          {practiceRules.map((rule, index) => {
            // Check progress for this specific level
            const isCompleted = stats.progress && stats.progress[index.toString()] > 0;

            return (
              <TouchableOpacity 
                key={rule.id}
                style={[
                  styles.menuCard, 
                  isCompleted && { borderColor: '#58CC02', borderWidth: 2 }
                ]}
                onPress={() => router.push({
                  pathname: "/game",
                  params: { levelIdx: index }
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>{rule.title}</Text>
                  {isCompleted && <Text style={{ fontSize: 18 }}>✅</Text>}
                </View>
                
                <View style={styles.soundBadgeContainer}>
                  {rule.target_sounds.map(s => (
                    <Text key={s} style={styles.soundBadge}>{s}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}