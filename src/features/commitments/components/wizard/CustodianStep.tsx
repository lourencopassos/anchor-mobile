import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/shared/utils/haptics.utils';

interface CustodianStepProps {
  custodianEmail: string | null;
  onSetCustodianEmail: (email: string | null) => void;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Design tokens following "Trusted Guardian" aesthetic
const COLORS = {
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',
  copperMuted: 'rgba(184, 115, 51, 0.08)',
  forest: '#2D5A4A',
  forestLight: 'rgba(45, 90, 74, 0.12)',
  cream: '#F5F0EB',
  error: '#B54548',
  neutral900: '#1C1917',
  neutral700: '#44403C',
  neutral600: '#57534E',
  neutral500: '#78716C',
  neutral400: '#A8A29E',
  neutral300: '#D6D3D1',
  neutral200: '#E7E5E4',
  neutral100: '#F5F5F4',
  white: '#FFFFFF',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustodianStep({
  custodianEmail,
  onSetCustodianEmail,
}: CustodianStepProps) {
  const { t } = useTranslation('custodian');
  const [inputEmail, setInputEmail] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleAddCustodian = useCallback(() => {
    const trimmedEmail = inputEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setInputError('Please enter an email address');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setInputError('Please enter a valid email address');
      return;
    }

    haptics.medium();
    onSetCustodianEmail(trimmedEmail);
    setInputEmail('');
    setInputError(null);
  }, [inputEmail, onSetCustodianEmail]);

  const handleRemoveCustodian = useCallback(() => {
    haptics.light();
    onSetCustodianEmail(null);
  }, [onSetCustodianEmail]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('wizard.selectCustodian')}</Text>
        <Text style={styles.description}>{t('wizard.custodianDescription')}</Text>
      </View>

      {/* Email Input Card */}
      {!custodianEmail && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.inputCard}
        >
          <View style={styles.inputRow}>
            <View style={[
              styles.inputWrapper,
              isInputFocused && styles.inputWrapperFocused,
              inputError && styles.inputWrapperError,
            ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={isInputFocused ? COLORS.copper : COLORS.neutral400}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={inputEmail}
                onChangeText={(text) => {
                  setInputEmail(text);
                  setInputError(null);
                }}
                placeholder={t('wizard.searchPlaceholder')}
                placeholderTextColor={COLORS.neutral400}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onSubmitEditing={handleAddCustodian}
                returnKeyType="done"
              />
            </View>
            <AddButton onPress={handleAddCustodian} disabled={!inputEmail.trim()} />
          </View>
          {inputError && (
            <Text style={styles.errorText}>{inputError}</Text>
          )}
        </Animated.View>
      )}

      {/* Selected Custodian Card */}
      {custodianEmail && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.selectedCard}
        >
          <View style={styles.selectedContent}>
            {/* Custodian Icon */}
            <View style={styles.custodianIcon}>
              <Text style={styles.custodianEmoji}>🏦</Text>
            </View>

            {/* Custodian Info */}
            <View style={styles.custodianInfo}>
              <Text style={styles.selectedLabel}>
                {t('wizard.selectedCustodian').toUpperCase()}
              </Text>
              <Text style={styles.selectedEmail}>{custodianEmail}</Text>
            </View>

            {/* Remove Button */}
            <Pressable
              onPress={handleRemoveCustodian}
              hitSlop={12}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={20} color={COLORS.neutral500} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <View style={styles.infoIconContainer}>
          <Text style={styles.infoIcon}>💡</Text>
        </View>
        <Text style={styles.infoText}>{t('wizard.custodianInfo')}</Text>
      </View>
    </View>
  );
}

// Add Button Component
function AddButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.addButton,
        disabled && styles.addButtonDisabled,
        animatedStyle,
      ]}
    >
      <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>
        Add
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: COLORS.neutral900,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neutral500,
  },

  // Input Card
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral200,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: COLORS.copper,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.neutral900,
    paddingVertical: 0,
  },
  addButton: {
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.neutral300,
    shadowOpacity: 0,
  },
  addButtonText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.white,
  },
  addButtonTextDisabled: {
    color: COLORS.neutral500,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.error,
    marginTop: 8,
  },

  // Selected Card
  selectedCard: {
    backgroundColor: COLORS.copperLight,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.copper,
    padding: 16,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  custodianIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.copperMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  custodianEmoji: {
    fontSize: 24,
  },
  custodianInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.copper,
    marginBottom: 2,
  },
  selectedEmail: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    color: COLORS.neutral900,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Option Card
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.neutral200,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: COLORS.forest,
    backgroundColor: COLORS.forestLight,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: 'rgba(45, 90, 74, 0.15)',
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.neutral900,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: COLORS.forest,
  },
  optionDescription: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral500,
  },
  optionDescriptionSelected: {
    color: COLORS.forest,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.forest,
    backgroundColor: COLORS.forest,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.copper,
    padding: 16,
    marginTop: 8,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.neutral600,
  },
});
