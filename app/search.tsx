import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Keyboard, Dimensions, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { filmsAPI, aiAPI } from '../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../src/utils/theme';
import { EmptyState } from '../src/components';

const { width } = Dimensions.get('window');

const TRENDING_SEARCHES = ['Sci-Fi', 'Sora Films', 'Runway', 'Short Film', 'AI Drama', 'Kling'];

const thumbColors: [string, string][] = [
  ['#1a0a2e', '#4a1a7a'],
  ['#0a1a2e', '#1a3a5a'],
  ['#2e0a1a', '#5a1a3a'],
  ['#0a2e1a', '#1a5a3a'],
  ['#2e1a0a', '#5a3a1a'],
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const doSearch = async (q: string) => {
    setLoading(true);
    setSearched(true);
    setAiKeywords([]);
    try {
      // If AI mode is on, convert natural language to keywords first
      let searchTerms = q;
      if (aiMode) {
        try {
          const { data } = await aiAPI.search(q);
          searchTerms = (data.keywords || [q]).join(' ');
          setAiKeywords(data.keywords || []);
        } catch (aiErr) {
          console.error('AI search error:', aiErr);
        }
      }
      const { data } = await filmsAPI.list({ search: searchTerms, limit: 20 });
      setResults(data.films);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n || 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textDim} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={aiMode ? "Try: funny space movies from the 90s..." : "Search films, creators, genres..."}
            placeholderTextColor={Colors.textDim}
            returnKeyType="search"
            onSubmitEditing={() => query && doSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.aiToggle, aiMode && styles.aiToggleActive]}
          onPress={() => { setAiMode(!aiMode); setAiKeywords([]); }}
          activeOpacity={0.7}
        >
          <Ionicons name={aiMode ? 'sparkles' : 'sparkles-outline'} size={18} color={aiMode ? Colors.white : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Empty / default state */}
      {!query && (
        <View style={styles.defaultContent}>
          <Text style={styles.sectionLabel}>TRENDING SEARCHES</Text>
          <View style={styles.trendingPills}>
            {TRENDING_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.trendingPill}
                onPress={() => setQuery(term)}
                activeOpacity={0.8}
              >
                <Ionicons name="trending-up" size={12} color={Colors.purpleNeon} />
                <Text style={styles.trendingPillText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>BROWSE BY GENRE</Text>
          <View style={styles.genreGrid}>
            {[
              { label: 'Sci-Fi', emoji: '🚀', colors: ['#0a1a2e', '#1a3a5a'] as [string, string] },
              { label: 'Drama', emoji: '🎭', colors: ['#2e0a1a', '#5a1a3a'] as [string, string] },
              { label: 'Thriller', emoji: '⚡', colors: ['#1a0a2e', '#4a1a7a'] as [string, string] },
              { label: 'Horror', emoji: '💀', colors: ['#1a0808', '#3a1010'] as [string, string] },
              { label: 'Fantasy', emoji: '🔮', colors: ['#0a2e1a', '#1a5a3a'] as [string, string] },
              { label: 'Documentary', emoji: '🌍', colors: ['#2e1a0a', '#5a3a1a'] as [string, string] },
            ].map((genre) => (
              <TouchableOpacity
                key={genre.label}
                style={styles.genreCard}
                onPress={() => router.push({ pathname: '/(tabs)/browse', params: { genre: genre.label } })}
                activeOpacity={0.85}
              >
                <LinearGradient colors={genre.colors} style={styles.genreCardInner}>
                  <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                  <Text style={styles.genreLabel}>{genre.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.purpleNeon} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Results */}
      {!loading && searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              {results.length > 0 && (
                <Text style={styles.resultsCount}>{results.length} results{aiMode && aiKeywords.length > 0 ? ` for "${aiKeywords.join(', ')}"` : ` for "${query}"`}</Text>
              )}
              {aiMode && aiKeywords.length > 0 && (
                <View style={styles.aiKeywordsRow}>
                  <Ionicons name="sparkles" size={12} color={Colors.purpleNeon} />
                  <Text style={styles.aiKeywordsText}>AI keywords: {aiKeywords.join(' • ')}</Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No results found" subtitle={`No films found for "${query}"`} />
          }
          renderItem={({ item, index }) => {
            const colors = thumbColors[index % thumbColors.length];
            return (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => { Keyboard.dismiss(); router.push(`/film/${item.id}`); }}
                activeOpacity={0.85}
              >
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={styles.resultThumb} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={colors} style={styles.resultThumb}>
                    <Text style={{ fontSize: 20 }}>🎬</Text>
                  </LinearGradient>
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.resultMeta}>
                    {item.genre && (
                      <View style={styles.resultTag}>
                        <Text style={styles.resultTagText}>{item.genre.toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.resultViews}>{formatViews(item.views)} views</Text>
                  </View>
                  <Text style={styles.resultCreator}>by @{item.creator_username}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textDim} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: 'rgba(168,85,247,0.1)',
  },
  backBtn: { padding: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: Colors.text, fontFamily: Fonts.body, fontSize: 14 },
  aiToggle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.dark3,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  aiToggleActive: {
    backgroundColor: Colors.purpleNeon,
    borderColor: Colors.purpleNeon,
  },
  aiKeywordsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 4, marginBottom: 8,
  },
  aiKeywordsText: { fontSize: 11, color: Colors.purpleNeon, fontFamily: Fonts.body, fontStyle: 'italic' },

  defaultContent: { padding: Spacing.md },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 2,
    fontFamily: Fonts.body,
    marginBottom: Spacing.sm,
  },

  trendingPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(139,47,201,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  trendingPillText: { fontSize: 13, color: Colors.text, fontFamily: Fonts.body, fontWeight: '500' },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genreCard: {
    width: (width - Spacing.md * 2 - 10) / 2,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  genreCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 10,
  },
  genreEmoji: { fontSize: 24 },
  genreLabel: {
    fontFamily: Fonts.display,
    fontSize: 18,
    letterSpacing: 1,
    color: Colors.white,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
  },
  loadingText: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.body },

  resultsList: { padding: Spacing.md, paddingBottom: 100 },
  resultsCount: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: Fonts.body,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  resultThumb: {
    width: 64,
    height: 90,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 15,
    color: Colors.white,
    marginBottom: 5,
  },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultTag: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  resultTagText: { fontSize: 9, fontWeight: '700', color: Colors.purpleNeon, letterSpacing: 0.8, fontFamily: Fonts.body },
  resultViews: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body },
  resultCreator: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body },
});
