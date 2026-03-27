import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../src/utils/theme';
import { getItem, setItem } from '../src/utils/storage';

const STORAGE_KEY = 'notificationPreferences';

const defaultPrefs = {
  newReleases: true,
  likesAndComments: true,
  creatorUpdates: true,
  watchlistReminders: false,
  marketing: false,
};

type PreferenceKey = keyof typeof defaultPrefs;

export default function NotificationsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const raw = await getItem(STORAGE_KEY);
      if (raw) {
        setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
      }
    } catch (error) {
      console.error('Failed to load notification preferences', error);
    }
  };

  const updatePref = async (key: PreferenceKey, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save notification preferences', error);
      Alert.alert('Save failed', 'Could not update notification settings right now.');
    }
  };

  const options: Array<{ key: PreferenceKey; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = [
    {
      key: 'newReleases',
      title: 'New Releases',
      subtitle: 'Alerts when fresh films land on VIVID.',
      icon: 'film-outline',
    },
    {
      key: 'likesAndComments',
      title: 'Likes & Comments',
      subtitle: 'Know when your films or profile get attention.',
      icon: 'heart-outline',
    },
    {
      key: 'creatorUpdates',
      title: 'Creator Updates',
      subtitle: 'Status changes for uploads, earnings, and creator tools.',
      icon: 'sparkles-outline',
    },
    {
      key: 'watchlistReminders',
      title: 'Watchlist Reminders',
      subtitle: 'Gentle nudges for films you saved and never finished.',
      icon: 'bookmark-outline',
    },
    {
      key: 'marketing',
      title: 'Promotions',
      subtitle: 'Occasional announcements about product updates and features.',
      icon: 'megaphone-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>NOTIFICATIONS</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="notifications-outline" size={24} color={Colors.purpleNeon} />
          <Text style={styles.heroTitle}>Notification Preferences</Text>
          <Text style={styles.heroSub}>
            Choose which updates you want to hear about from VIVID.
          </Text>
        </View>

        {options.map((option) => (
          <View key={option.key} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={option.icon} size={20} color={Colors.purpleNeon} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>{option.title}</Text>
              <Text style={styles.rowSub}>{option.subtitle}</Text>
            </View>
            <Switch
              value={prefs[option.key]}
              onValueChange={(value) => updatePref(option.key, value)}
              trackColor={{ false: Colors.dark4, true: 'rgba(192,132,252,0.45)' }}
              thumbColor={prefs[option.key] ? Colors.purpleNeon : '#d1d5db'}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: 24,
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.dark3,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroTitle: {
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: 18,
    letterSpacing: 1,
  },
  heroSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    lineHeight: 22,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168,85,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: Colors.white,
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 15,
  },
  rowSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
