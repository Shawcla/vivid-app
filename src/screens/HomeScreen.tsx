import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Dimensions, Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { filmsAPI, aiAPI } from '../services/api';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.md * 2;
const THUMB_HEIGHT = Math.round((CARD_WIDTH * 9) / 16);

const TABS = ['Trending', 'New Releases', 'Featured'];

function formatViews(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface VideoCardProps {
  film: any;
  onPress: () => void;
}

function VideoCard({ film, onPress }: VideoCardProps) {
  const duration = formatDuration(film.duration_seconds);
  const views = film.views ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      {/* Thumbnail — 16:9 full width */}
      <View style={styles.thumbWrap}>
        {film.thumbnail_url ? (
          <Image
            source={{ uri: film.thumbnail_url }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient colors={['#1a0a2e', '#4a1a7a']} style={styles.thumb} />
        )}
        {duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={Colors.textDim} />
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{film.title}</Text>
          <Text style={styles.metaLine}>{film.creator_username || 'VIVID Creator'}</Text>
          <Text style={styles.metaLine}>
            {formatViews(views)} views · {film.genre || 'Film'}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={14} color={Colors.textDim} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [allFilms, setAllFilms] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [aiMood, setAiMood] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [listRes, featRes] = await Promise.all([
        filmsAPI.list({ limit: 50 }),
        filmsAPI.featured(),
      ]);
      const films = listRes.data.films || [];
      setAllFilms(films);
      setFeatured(featRes.data.films || films.slice(0, 6));
    } catch (err: any) {
      console.error('Home load error:', err?.message || err);
      setError(err?.message || 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const MOODS = [
    { label: 'Feel Good', value: 'feel good' },
    { label: 'Horror', value: 'horror' },
    { label: 'Action', value: 'action' },
    { label: 'Drama', value: 'drama' },
    { label: 'Comedy', value: 'comedy' },
    { label: 'Mystery', value: 'mystery' },
    { label: 'Sci-Fi', value: 'sci-fi' },
    { label: 'Romance', value: 'romance' },
  ];

  const fetchAIRecommendations = async (mood: string) => {
    if (aiMood === mood && aiRecommendations.length > 0) {
      setAiMood(null);
      setAiRecommendations([]);
      return;
    }
    setAiMood(mood);
    setAiLoading(true);
    try {
      const { data } = await aiAPI.recommend({ mood });
      setAiRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('AI recommendations error:', err);
      setAiRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  };

  const getTabData = () => {
    if (activeTab === 0) {
      // Trending = most views
      return [...allFilms].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    if (activeTab === 1) {
      // New Releases = most recent
      return [...allFilms].sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }
    return featured;
  };

  const data = getTabData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>VIVID</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { setActiveTab(i); }}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Mood Selector */}
      <View style={styles.aiSection}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={16} color={Colors.purpleNeon} />
          <Text style={styles.aiHeaderText}>AI RECOMMENDATIONS</Text>
        </View>
        <FlatList
          data={MOODS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.moodList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.moodChip, aiMood === item.value && styles.moodChipActive]}
              onPress={() => fetchAIRecommendations(item.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.moodText, aiMood === item.value && styles.moodTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        {aiMood && (
          <View style={styles.aiResults}>
            {aiLoading ? (
              <Text style={styles.aiLoadingText}>🤖 Thinking...</Text>
            ) : aiRecommendations.length > 0 ? (
              <>
                <Text style={styles.aiResultsTitle}>You might like:</Text>
                {aiRecommendations.map((rec, i) => (
                  <Text key={i} style={styles.aiRecItem}>• {rec}</Text>
                ))}
              </>
            ) : (
              <Text style={styles.aiLoadingText}>No recommendations found</Text>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={36} color={Colors.purpleNeon} />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={44} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.retryText}>TAP TO RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="film-outline" size={50} color={Colors.textDim} />
          <Text style={styles.emptyTitle}>No videos yet</Text>
          <Text style={styles.emptySub}>Check back soon for new content</Text>
        </View>
      ) : (
        <FlatList

          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purpleNeon} />
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => (
            <VideoCard film={item} onPress={() => router.push(`/film/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  logo: {
    fontFamily: Fonts.display, fontSize: 22, fontWeight: '900',
    color: Colors.purpleNeon, letterSpacing: 3,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBtn: { padding: Spacing.xs },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.white },
  tabText: {
    fontSize: 13, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.3,
  },
  tabTextActive: { color: Colors.white },

  // Feed
  feed: { paddingHorizontal: 0, paddingTop: Spacing.md, paddingBottom: 110 },
  card: { backgroundColor: Colors.dark },
  thumbWrap: { width: '100%', height: THUMB_HEIGHT, backgroundColor: Colors.dark3 },
  thumb: { width: '100%', height: '100%' },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  durationText: { color: Colors.white, fontSize: 12, fontWeight: '700', fontFamily: Fonts.body },
  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.dark3, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  metaInfo: { flex: 1 },
  videoTitle: {
    fontFamily: Fonts.body, fontSize: 15, fontWeight: '700',
    color: Colors.white, marginBottom: 3, lineHeight: 20,
  },
  metaLine: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  menuBtn: { padding: Spacing.xs, alignSelf: 'flex-start' },

  // AI Section
  aiSection: {
    paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  aiHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  aiHeaderText: {
    fontFamily: Fonts.display, fontSize: 11, letterSpacing: 1.5,
    color: Colors.purpleNeon, fontWeight: '700',
  },
  moodList: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  moodChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(168,85,247,0.18)',
  },
  moodChipActive: {
    backgroundColor: Colors.purpleNeon, borderColor: Colors.purpleNeon,
  },
  moodText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.body },
  moodTextActive: { color: Colors.white, fontWeight: '700' },
  aiResults: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    padding: Spacing.md, backgroundColor: Colors.dark3,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
  },
  aiResultsTitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 6, fontFamily: Fonts.body },
  aiRecItem: { fontSize: 14, color: Colors.white, fontFamily: Fonts.body, marginBottom: 4 },
  aiLoadingText: { fontSize: 13, color: Colors.textDim, fontFamily: Fonts.body, fontStyle: 'italic' },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: 15, fontFamily: Fonts.body },
  errorText: { color: Colors.error, fontSize: 14, fontFamily: Fonts.body, textAlign: 'center', paddingHorizontal: Spacing.xl },
  retryText: { color: Colors.purpleNeon, fontSize: 13, fontWeight: '700', fontFamily: Fonts.body, letterSpacing: 1 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.white },
  emptySub: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.body },
});
