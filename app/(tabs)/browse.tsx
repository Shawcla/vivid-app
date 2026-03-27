import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { filmsAPI } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { FilmCard, GenrePill, EmptyState } from '../../src/components';

const GENRES = ['All', 'Sci-Fi', 'Drama', 'Thriller', 'Horror', 'Fantasy', 'Documentary', 'Comedy', 'Action', 'Animation'];
const SORTS = [
  { key: 'recent', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'trending', label: 'Trending' },
];

export default function BrowseScreen() {
  const router = useRouter();
  const [films, setFilms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  const loadFilms = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const { data } = await filmsAPI.list({
        genre: genre !== 'All' ? genre : undefined,
        sort: sort as any,
        search: search || undefined,
        page: currentPage,
        limit: 18,
      });
      if (reset) {
        setFilms(data.films);
        setPage(2);
      } else {
        setFilms((prev) => [...prev, ...data.films]);
        setPage(currentPage + 1);
      }
      setHasMore(data.pagination.page < data.pagination.pages);
      setInitialLoad(true);
    } catch (err) {
      console.error('Browse load error:', err);
    } finally {
      setLoading(false);
    }
  }, [genre, sort, search, page, loading]);

  React.useEffect(() => { loadFilms(true); }, [genre, sort]);

  const handleSearch = () => loadFilms(true);

  const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 2 - 8 * 2) / 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BROWSE</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textDim} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            placeholder="Search films, creators..."
            placeholderTextColor={Colors.textDim}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); loadFilms(true); }}>
              <Ionicons name="close-circle" size={16} color={Colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortTab, sort === s.key && styles.sortTabActive]}
            onPress={() => setSort(s.key)}
          >
            <Text style={[styles.sortTabText, sort === s.key && styles.sortTabTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Genre pills */}
      <FlatList
        data={GENRES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.genreRow}
        renderItem={({ item }) => (
          <GenrePill label={item} active={genre === item} onPress={() => setGenre(item)} />
        )}
        style={{ flexGrow: 0, marginBottom: Spacing.md }}
      />

      {/* Films grid */}
      <FlatList
        data={films}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasMore && loadFilms()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          initialLoad && !loading ? (
            <EmptyState icon="🔍" title="No films found" subtitle="Try different filters or search terms" />
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator color={Colors.purpleNeon} style={{ marginVertical: 20 }} /> : null
        }
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            width={CARD_WIDTH}
            onPress={() => router.push(`/film/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, marginBottom: Spacing.sm },
  title: { fontFamily: Fonts.display, fontSize: 26, letterSpacing: 2, color: Colors.white },

  searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchBox: {
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

  sortRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 8 },
  sortTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.dark3, borderWidth: 1, borderColor: 'transparent' },
  sortTabActive: { borderColor: Colors.purpleNeon, backgroundColor: 'rgba(139,47,201,0.15)' },
  sortTabText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, fontFamily: Fonts.body },
  sortTabTextActive: { color: Colors.purpleNeon },

  genreRow: { paddingHorizontal: Spacing.md },
  grid: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: { gap: 8, marginBottom: 8 },
});
