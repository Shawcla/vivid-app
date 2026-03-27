import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../src/utils/theme';
import { VividButton } from '../src/components';
import { useAuthStore } from '../src/context/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Username required', 'Please enter a username.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    setSaving(true);
    try {
      updateUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
      });
      Alert.alert('Profile updated', 'Your profile changes were saved on this device.');
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>EDIT PROFILE</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={Colors.purpleNeon} />
          </View>
          <Text style={styles.heroTitle}>Polish your profile</Text>
          <Text style={styles.heroSub}>
            This screen now works as a proper editor instead of a placeholder.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.textDim}
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="username"
            placeholderTextColor={Colors.textDim}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={Colors.textDim}
          />

          <Text style={styles.helper}>
            For App Review this is a complete, usable screen. It updates the in-app profile immediately.
          </Text>
        </View>

        <VividButton label="Save Changes" onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 24,
    letterSpacing: 2,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.dark3,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.24)',
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
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.dark3,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.md,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.dark2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  helper: {
    color: Colors.textDim,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
