import { useFocusEffect, useRouter } from 'expo-router';
import { Check, Flame, Heart, Lock, Star } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import wordBank from '../data/wordBank.json';
import { layoutStyles } from '../styles/layout';
import { colors } from '../styles/theme';
import { getUserStats, UserStats } from '../utils/storage';

export default function MainMenu() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadStats = async () => {
    const data = await getUserStats();
    setStats(data);
  };

  // Automatically refresh stats when the user returns from game.tsx
  useFocusEffect(
    useCallback(() => {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const flatSublevels = useMemo(() => {
    return wordBank.flatMap(level =>
      level.sublevels.map(s => ({ ...s, id: `${level.level}-${s.sublevel}` }))
    );
  }, []);

  if (!stats) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER HUD --- */}
      <View style={layoutStyles.headerContainer}>
        <View style={layoutStyles.statItem}>
          <Flame color={colors.heartRed} size={20} fill={colors.heartRed} />
          <Text style={layoutStyles.statText}>4</Text>
        </View>
        <View style={[layoutStyles.statItem, layoutStyles.starBg]}>
          <Star color={colors.gold} size={20} fill={colors.gold} />
          <Text style={[layoutStyles.statText, layoutStyles.whiteText]}>{stats.stars.toLocaleString()}</Text>
        </View>
        <View style={layoutStyles.statItem}>
          <Heart color={colors.heartRed} size={20} fill={colors.heartRed} />
          <Text style={layoutStyles.statText}>{stats.lives}</Text>
        </View>
      </View>

      {/* --- THE PATH --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {wordBank.map((levelBlock) => (
          <View 
            key={`level-${levelBlock.level}`} 
            style={styles.levelBlockWrapper}
          >
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{levelBlock.level_title}</Text>
            </View>

            {/* Nodes */}
            {levelBlock.sublevels.map((sublevel) => {
              const id = `${levelBlock.level}-${sublevel.sublevel}`;
              const absoluteIndex = flatSublevels.findIndex(s => s.id === id);
              const isFirstNode = absoluteIndex === 0;
              const prevNode = isFirstNode ? null : flatSublevels[absoluteIndex - 1];
              
              const isUnlocked = isFirstNode || (stats.progress && stats.progress[prevNode!.id] > 0);
              const isCompleted = stats.progress && stats.progress[id] > 0;
              const isCurrent = isUnlocked && !isCompleted;

              const translateX = Math.sin(absoluteIndex * 0.9) * 60;

              return (
                <View 
                  key={id} 
                  style={[styles.nodeWrapper, { transform: [{ translateX }] }]}
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
                      params: { levelId: id }
                    })}
                  >
                    {isCompleted ? (
                      <Check color="#fff" size={40} strokeWidth={3} />
                    ) : !isUnlocked ? (
                      <Lock color={colors.textMuted} size={32} />
                    ) : (
                      <Star color="#fff" size={32} fill="#fff" />
                    )}
                  </TouchableOpacity>

                  {/* The Level Label */}
                  <View style={styles.nodeLabelContainer}>
                    <Text style={[styles.nodeLabel, !isUnlocked && styles.nodeLabelLocked]}>
                      {sublevel.description}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  sectionHeader: {
    backgroundColor: colors.duoGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '90%',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: colors.textWhite,
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
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nodeCompleted: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
  },
  nodeCurrent: {
    backgroundColor: colors.duoGreen,
    borderColor: colors.duoGreenDark,
    transform: [{ scale: 1.1 }],
  },
  nodeLocked: {
    backgroundColor: colors.locked,
    borderColor: colors.lockedDark,
  },
  nodeLabelContainer: {
    marginTop: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMain,
  },
  nodeLabelLocked: {
    color: colors.textMuted,
  }
});