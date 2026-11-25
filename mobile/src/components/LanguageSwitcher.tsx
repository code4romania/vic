import React, { useRef } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import {
  APP_LANGUAGES,
  AppLanguage,
  DEFAULT_LANGUAGE,
  isAppLanguage,
} from '../common/config/language';
import { chooseLanguage } from '../services/language/language.service';
import { Sheet } from './ui/Sheet';
import { AppText } from '../design/components/Text';
import { Group } from '../design/components/Group';
import { ListRow } from '../design/components/ListRow';
import { haptics } from '../design/haptics';
import { CheckIcon, GlobeIcon, ICON_STROKE } from '../design/icons';
import { hit, palette } from '../design/tokens';

// A language is always written in itself, whatever language the app is in.
export const LANGUAGE_NAMES: Record<AppLanguage, string> = { ro: 'Română', en: 'English' };
const LANGUAGE_CODES: Record<AppLanguage, string> = { ro: 'RO', en: 'EN' };

const useAppLanguage = (): AppLanguage => {
  const { i18n } = useTranslation();
  return isAppLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
};

export interface LanguageToggleProps {
  /** `onNavy` for the intro and the entry screen, `onPaper` for the login screen */
  tone?: 'onNavy' | 'onPaper';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The small switch of the screens before login: „RO | EN” in a pill, the current one on yellow.
 * Each half is a 44pt target; the app changes language at once and remembers it.
 */
export const LanguageToggle = ({
  tone = 'onNavy',
  style,
  testID = 'language-toggle',
}: LanguageToggleProps) => {
  const { t } = useTranslation('language');
  const current = useAppLanguage();

  return (
    <View
      style={[styles.toggle, tone === 'onNavy' ? styles.toggleOnNavy : styles.toggleOnPaper, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel={`${t('title')}`}
      testID={testID}
    >
      {APP_LANGUAGES.map((language) => {
        const selected = language === current;
        return (
          <Pressable
            key={language}
            onPress={() => {
              if (!selected) {
                haptics.selection();
                chooseLanguage(language);
              }
            }}
            accessibilityRole="radio"
            accessibilityLabel={LANGUAGE_NAMES[language]}
            accessibilityState={{ selected, checked: selected }}
            style={styles.half}
            testID={`${testID}-${language}`}
          >
            {/* Android keeps the corners only for a background present when the view is mounted:
                re-styled in place, the yellow lozenge turned square. A new key mounts it again. */}
            <View
              key={selected ? 'selected' : 'idle'}
              style={[styles.code, selected ? styles.codeSelected : null]}
            >
              <AppText
                variant="label"
                color={selected || tone === 'onPaper' ? palette.navy : palette.white}
              >
                {LANGUAGE_CODES[language]}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

/**
 * „Limba aplicației” in Profil: a row that shows the current language and opens a sheet with the
 * two languages. Choosing one changes the app at once and saves it on the account, so the
 * notifications and the emails follow.
 */
export const LanguageRow = ({ testID = 'profile-language' }: { testID?: string }) => {
  const { t } = useTranslation('language');
  const current = useAppLanguage();
  const sheet = useRef<BottomSheetModal>(null);

  const onChoose = (language: AppLanguage) => {
    sheet.current?.dismiss();
    if (language !== current) {
      chooseLanguage(language);
    }
  };

  return (
    <>
      <ListRow
        icon={GlobeIcon}
        title={`${t('title')}`}
        subtitle={LANGUAGE_NAMES[current]}
        onPress={() => sheet.current?.present()}
        testID={testID}
      />
      <Sheet ref={sheet} title={`${t('title')}`} subtitle={`${t('hint')}`} testID="language-sheet">
        <Group>
          {APP_LANGUAGES.map((language) => {
            const selected = language === current;
            return (
              <ListRow
                key={language}
                title={LANGUAGE_NAMES[language]}
                trailing={
                  selected ? (
                    <CheckIcon size={20} color={palette.navy} strokeWidth={ICON_STROKE + 0.5} />
                  ) : null
                }
                onPress={() => onChoose(language)}
                accessibilityLabel={
                  selected
                    ? `${LANGUAGE_NAMES[language]}, ${t('selected')}`
                    : LANGUAGE_NAMES[language]
                }
                testID={`language-option-${language}`}
              />
            );
          })}
        </Group>
      </Sheet>
    </>
  );
};

export default LanguageRow;

const styles = StyleSheet.create((theme) => ({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 2,
  },
  toggleOnNavy: { backgroundColor: 'rgba(255,255,255,0.14)' },
  toggleOnPaper: { backgroundColor: theme.colors.card },
  // the whole half is the target; the yellow lozenge inside is only what you see
  half: {
    minWidth: hit.min,
    minHeight: hit.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    minWidth: 38,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  codeSelected: { backgroundColor: theme.colors.yellow },
}));
