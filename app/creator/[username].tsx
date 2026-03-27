import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { creatorsAPI } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { FilmCard, LoadingSpinner, EmptyState } from '../../src/components';

const { width } = Dimensions.get('window');

export default function CreatorProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => { loadCreator(); }, [username]);

  const loadCreator = async () => {
    try {
      const { data } = await creatorsAPI.getProfile(username);
      setCreator(data.creator);
      setFilms(data.films);
    } catch (err) {
      console.error('Creator load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n || 0);
  };

  if (loading) return <LoadingSpinner />;
  if (!creator) return (
    <SafeAreaView style={styles.container}>
      <EmptyState icon="👤" title="Creator not found" />
    </SafeAreaView>
  );

  const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm * 2) / 3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Hero gradient */}
        <LinearGradient
          colors={['rgba(139,47,201,0.3)', 'transparent']}
          style={styles.heroGradient}
        />

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <LinearGradient colors={[Colors.purple, Colors.purpleGlow]} style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>🎬</Text>
          </LinearGradient>
        </View>

        {/* Name & info */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.handle}>@{creator.username}</Text>

          {creator.bio && (
            <Text style={styles.bio}>{creator.bio}</Text>
          )}

          {/* Plan badge */}
          <View style={styles.planBadge}>
            <Text style={styles.planText}>
              {creator.plan === 'studio' ? '🏢 STUDIO' : '⚡ CREATOR'}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'FILMS', value: formatNum(creator.film_count) },
            { label: 'VIEWS', value: formatNum(creator.total_views) },
            { label: 'LIKES', value: formatNum(creator.total_likes) },
            { label: 'FOLLOWERS', value: formatNum(creator.followers) },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Follow button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followingBtn]}
            onPress={() => setFollowing(!following)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={following ? 'checkmark' : 'add'}
              size={16}
              color={following ? Colors.purpleNeon : Colors.white}
            />
            <Text style={[styles.followBtnText, following && { color: Colors.purpleNeon }]}>
              {following ? 'FOLLOWING' : 'FOLLOW'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Films section */}
        <View style={styles.filmsSection}>
          <Text style={styles.sectionTitle}>FILMS</Text>

          {films.length === 0 ? (
            <EmptyState icon="🎬" title="No films yet" subtitle="This creator hasn't uploaded any films" />
          ) : (
            <View style={styles.filmGrid}>
              {films.map((film) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  width={CARD_WIDTH}
                  onPress={() => router.push(`/film/${film.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },

  backBtn: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },

  avatarWrap: { alignItems: 'center', marginTop: 60, marginBottom: Spacing.md },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(168,85,247,0.5)',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },

  nameSection: { alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  name: {
    fontFamily: Fonts.display,
    fontSize: 30,
    letterSpacing: 1.5,
    color: Colors.white,
    marginBottom: 4,
  },
  handle: { fontSize: 14, color: Colors.purpleNeon, fontFamily: Fonts.body, marginBottom: 10 },
  bio: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },
  planBadge: {
    backgroundColor: 'rgba(139,47,201,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  planText: { fontSize: 10, fontWeight: '700', color: Colors.purpleNeon, letterSpacing: 1.5, fontFamily: Fonts.body },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.12)',
    marginBottom: Spacing.md,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.purpleNeon,
    textShadowColor: Colors.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, fontFamily: Fonts.body, marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.purple,
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.purpleNeon,
    shadowOpacity: 0,
    elevation: 0,
  },
  followBtnText: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 13,
    color: Colors.white,
    letterSpacing: 1.5,
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark3,
  },

  divider: { height: 1, backgroundColor: 'rgba(168,85,247,0.1)', marginHorizontal: Spacing.md, marginBottom: Spacing.lg },

  filmsSection: { paddingHorizontal: Spacing.md },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 18,
    letterSpacing: 2,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  filmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
