import { useFocusEffect, useRouter } from 'expo-router';
import { Check, Flame, Heart, Lock, Star } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import { layoutStyles } from '../styles/layout';
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
      // Just a quick reminder: this is still checking every 10 seconds! 
      // If you meant to change it to daily, you can do it here later.
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const flatSublevels = useMemo(() => {
    return practiceRules.flatMap(level => level.sublevels);
  }, []);

  if (!stats) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER HUD --- */}
      <View style={layoutStyles.headerContainer}>
        <View style={layoutStyles.statItem}>
          <Flame color="#FF4B4B" size={20} fill="#FF4B4B" />
          <Text style={layoutStyles.statText}>4</Text>
        </View>
        <View style={[layoutStyles.statItem, layoutStyles.starBg]}>
          <Star color="#FFD700" size={20} fill="#FFD700" />
          <Text style={[layoutStyles.statText, layoutStyles.whiteText]}>{stats.stars.toLocaleString()}</Text>
        </View>
        <View style={layoutStyles.statItem}>
          <Heart color="#FF4B4B" size={20} fill="#FF4B4B" />
          <Text style={layoutStyles.statText}>{stats.lives}</Text>
        </View>
      </View>

      {/* --- THE PATH --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {practiceRules.map((levelBlock) => (
          <View key={`level-${levelBlock.level}`} style={styles.levelBlockWrapper}>
            
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{levelBlock.level_title}</Text>
            </View>

            {/* Nodes */}
            {levelBlock.sublevels.map((sublevel) => {
              const absoluteIndex = flatSublevels.findIndex(s => s.id === sublevel.id);
              const isFirstNode = absoluteIndex === 0;
              const prevNode = isFirstNode ? null : flatSublevels[absoluteIndex - 1];
              
              const isUnlocked = isFirstNode || (stats.progress && stats.progress[prevNode!.id] > 0);
              const isCompleted = stats.progress && stats.progress[sublevel.id] > 0;
              const isCurrent = isUnlocked && !isCompleted;

              const translateX = Math.sin(absoluteIndex * 0.9) * 60;

              return (
                <View 
                  key={sublevel.id} 
                  style={[styles.nodeWrapper, { transform: [{ translateX }] }]} // Transform stays inline!
                >
                  
                  {/* The Circular Button */}
                  <TouchableOpacity 
                    disabled={!isUnlocked}
                    activeOpacity={0.8}
                    style={[
                      styles.node,
                      isCompleted && styles.nodeCompleted,
                      isCurrent && styles.nodeCurrent,
                      !isUnlocked && styles.nodeLocked,
                    ]}
                    onPress={() => router.push({
                      pathname: "/game",
                      params: { levelId: sublevel.id }
                    })}
                  >
                    {isCompleted ? (
                      <Check color="#fff" size={40} strokeWidth={3} />
                    ) : !isUnlocked ? (
                      <Lock color="#999" size={32} />
                    ) : (
                      <Star color="#fff" size={32} fill="#fff" />
                    )}
                  </TouchableOpacity>

                  {/* The Level Label */}
                  <View style={styles.nodeLabelContainer}>
                    <Text style={[styles.nodeLabel, !isUnlocked && styles.nodeLabelLocked]}>
                      {sublevel.title}
                    </Text>
                  </View>

                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  // Extracted Styles
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  levelBlockWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  
  // Existing Styles
  sectionHeader: {
    backgroundColor: '#58CC02',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '90%',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeCompleted: {
    backgroundColor: '#FFD700',
    borderColor: '#E5C100',
  },
  nodeCurrent: {
    backgroundColor: '#58CC02',
    borderColor: '#4BAA00',
    transform: [{ scale: 1.1 }],
  },
  nodeLocked: {
    backgroundColor: '#E5E5E5',
    borderColor: '#CECECE',
  },
  nodeLabelContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B4B4B',
  },
  nodeLabelLocked: {
    color: '#bbb',
  }
});