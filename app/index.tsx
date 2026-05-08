import { useFocusEffect, useRouter } from 'expo-router';
import { Flame, Heart, Lock, Star } from 'lucide-react-native'; // Added Lock icon
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import { layoutStyles } from '../styles/layout';
import { theme as styles } from '../styles/theme';
import { getUserStats, UserStats } from '../utils/storage';

export default function MainMenu() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadStats = async () => {
    const data = await getUserStats();
    setStats(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  if (!stats) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* --- HEADER --- */}
      <View style={layoutStyles.headerContainer}>
        <View style={layoutStyles.statItem}><Flame color="#FF4B4B" size={20} fill="#FF4B4B" /><Text style={layoutStyles.statText}>4</Text></View>
        <View style={[layoutStyles.statItem, layoutStyles.starBg]}>
          <Star color="#FFD700" size={20} fill="#FFD700" />
          <Text style={[layoutStyles.statText, layoutStyles.whiteText]}>{stats.stars.toLocaleString()}</Text>
        </View>
        <View style={layoutStyles.statItem}><Heart color="#FF4B4B" size={20} fill="#FF4B4B" /><Text style={layoutStyles.statText}>{stats.lives}</Text></View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.menuTitle}>Niveaux</Text>
        
        <View style={styles.menuGrid}>
          {practiceRules.map((rule, index) => {
            // --- PROGRESS LOGIC ---
            const isCompleted = stats.progress && stats.progress[index.toString()] > 0;
            
            // Level 0 is always unlocked. 
            // Others are unlocked only if the one BEFORE it (index - 1) is completed.
            const isUnlocked = index === 0 || (stats.progress && stats.progress[(index - 1).toString()] > 0);

            return (
              <TouchableOpacity 
                key={rule.id}
                disabled={!isUnlocked} // Disable clicking if locked
                style={[
                  styles.menuCard, 
                  isCompleted && { borderColor: '#58CC02', borderWidth: 2 },
                  !isUnlocked && { opacity: 0.5, backgroundColor: '#F0F0F0', borderColor: '#CCC' } // Visual "Locked" style
                ]}
                onPress={() => router.push({
                  pathname: "/game",
                  params: { levelIdx: index }
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!isUnlocked && <Lock color="#999" size={18} />}
                    <Text style={[styles.cardTitle, !isUnlocked && { color: '#999' }]}>
                      {rule.title}
                    </Text>
                  </View>
                  {isCompleted && <Text style={{ fontSize: 18 }}>✅</Text>}
                </View>
                
                {/* Only show sounds if unlocked to keep it mysterious */}
                <View style={styles.soundBadgeContainer}>
                  {isUnlocked ? rule.target_sounds.map(s => (
                    <Text key={s} style={styles.soundBadge}>{s}</Text>
                  )) : <Text style={{color: '#BBB', fontStyle: 'italic'}}>Verrouillé</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}