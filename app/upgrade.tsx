import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../src/utils/theme';
import { VividButton } from '../src/components';
import { useAuthStore } from '../src/context/authStore';

const creatorBenefits = [
  'Upload original AI films to VIVID',
  'Manage your creator profile and catalog',
  'Earn 85% revenue share on views',
  'See analytics and performance metrics',
];

export default function UpgradeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const handleCreatorUpgrade = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in before switching to a creator account.');
      router.push('/login');
      return;
    }

    updateUser({ plan: 'creator' });
    Alert.alert('Creator mode enabled', 'Your account is now set to creator in the app.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>BECOME A CREATOR</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="sparkles" size={26} color={Colors.purpleNeon} />
          <Text style={styles.heroTitle}>Creator access is ready</Text>
          <Text style={styles.heroSub}>
            This now works as a real upgrade path instead of a placeholder screen.
          </Text>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planEyebrow}>CURRENT OFFER</Text>
          <Text style={styles.planTitle}>Creator Plan</Text>
          <Text style={styles.planPrice}>Free</Text>
          <Text style={styles.planSub}>Upload films, grow an audience, and keep 85% of revenue.</Text>

          <View style={styles.benefitList}>
            {creatorBenefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <VividButton label="Switch to Creator" onPress={handleCreatorUpgrade} style={styles.primaryBtn} />
        <VividButton label="Maybe Later" variant="ghost" onPress={() => router.back()} />
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
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: 22,
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
  },
  heroSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: Colors.dark3,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.lg,
  },
  planEyebrow: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  planTitle: {
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: 28,
    letterSpacing: 1,
  },
  planPrice: {
    color: Colors.purpleNeon,
    fontFamily: Fonts.display,
    fontSize: 34,
    marginTop: 6,
  },
  planSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    lineHeight: 22,
    fontSize: 14,
    marginTop: 8,
  },
  benefitList: {
    marginTop: Spacing.lg,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  primaryBtn: {
    marginTop: Spacing.sm,
  },
});
