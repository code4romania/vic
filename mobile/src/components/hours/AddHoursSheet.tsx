import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Alert, Keyboard, Pressable, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useCreateActivityLogMutation } from '../../services/activity-log/activity-log.service';
import { InternalErrors } from '../../common/errors/internal-errors.class';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';
import { useUserProfile } from '../../store/profile/profile.selector';
import { useBackToClose } from '../../hooks/useBackToClose';
import ActivityLogForm, { ActivityLogFormTypes, activityLogSchema } from '../ActivityLogForm';
import { fontScaleCap, palette } from '../../design/tokens';
import { duration } from '../../design/motion';
import { haptics } from '../../design/haptics';
import { CloseIcon, ICON_STROKE } from '../../design/icons';
import { Button } from '../../design/components/Button';
import { Sheet } from '../../design/components/Sheet';
import { tight, useEffectiveFontScale } from '../../design/components/Text';
import { SubmitSuccess } from './SubmitSuccess';

/** How long „Trimis spre aprobare” stays before the sheet closes (prototype: 1.7 s). */
export const SUCCESS_DWELL_MS = 1700;

export interface AddHoursSheetHandle {
  present: () => void;
}

export interface AddHoursSheetProps {
  /** the sheet's position, for the screen behind it (useSheetBackdropProgress) */
  animatedPosition?: SharedValue<number>;
  /** called as the sheet closes after a successful send, with the new entry */
  onSent?: (log: IActivityLog) => void;
}

const defaultValues = (): Partial<ActivityLogFormTypes> => ({ date: new Date(), hours: '1' });

/**
 * „Adaugă ore” as a 92% form sheet (prototype `.sheet`): Eveniment (optional), Activitate, Data with
 * Azi / Ieri, the hours stepper, Mențiuni, and the sticky yellow „Trimite spre aprobare →”. On
 * success the sheet shows „Trimis spre aprobare”, then closes and hands the new entry to Ore.
 * Changed fields ask before the sheet is closed.
 */
export const AddHoursSheet = forwardRef<AddHoursSheetHandle, AddHoursSheetProps>(
  ({ animatedPosition, onSent }, ref) => {
    const { t } = useTranslation('activity_log');
    const { userProfile } = useUserProfile();
    const organization = userProfile?.activeOrganization;
    const sheetRef = useRef<BottomSheetModal>(null);
    // the form lives only while the sheet is open, so each opening starts fresh
    const [mounted, setMounted] = useState(false);
    const [sent, setSent] = useState<{ hours: number } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { mutate: logHours, isLoading: isLoggingHours } = useCreateActivityLogMutation();

    // Keyboard up: the sheet only rises to its top inset, so its lower part (and the scroll view in
    // it) stays behind the keyboard while the sticky footer rides above it. A spacer as tall as the
    // keyboard lets the last field scroll above the footer, and a focused „Mențiuni” is scrolled
    // there once the keyboard is up (and again as it grows line by line).
    const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
    const mentionsFocused = useRef(false);
    const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
    const keyboardSpacer = useAnimatedStyle(() => ({ height: Math.abs(keyboardHeight.value) }));
    const revealMentions = useCallback(() => {
      if (mentionsFocused.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    }, []);
    useEffect(() => {
      const shown = Keyboard.addListener('keyboardDidShow', revealMentions);
      return () => shown.remove();
    }, [revealMentions]);
    const onMentionsFocus = useCallback(() => {
      mentionsFocused.current = true;
      // already up (moving from another field): scroll now; else keyboardDidShow does it
      if (Keyboard.isVisible()) {
        revealMentions();
      }
    }, [revealMentions]);
    const onMentionsBlur = useCallback(() => {
      mentionsFocused.current = false;
    }, []);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = useForm<ActivityLogFormTypes>({
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      resolver: yupResolver(activityLogSchema) as any,
      defaultValues: defaultValues(),
    });

    useEffect(
      () => () => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          reset(defaultValues());
          setSent(null);
          setMounted(true);
          sheetRef.current?.present();
        },
      }),
      [reset],
    );

    const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

    // with changes not sent yet, ask first (as the add-activity-log screen does)
    const guarded = isDirty && !sent;
    const requestClose = useCallback(() => {
      if (!guarded) {
        dismiss();
        return;
      }
      Alert.alert(`${t('general:discard.title')}`, `${t('general:discard.message')}`, [
        { text: `${t('general:discard.keep')}`, style: 'cancel' },
        { text: `${t('general:discard.leave')}`, style: 'destructive', onPress: dismiss },
      ]);
    }, [guarded, dismiss, t]);
    useBackToClose(mounted && guarded, requestClose);

    const onSubmit = (activityLog: ActivityLogFormTypes) => {
      logHours(
        {
          activityLog: {
            ...activityLog,
            // „Fără eveniment” clears the event: send none rather than an empty id
            eventId: activityLog.eventId || (undefined as unknown as string),
            volunteerId: organization?.volunteerId,
          },
        },
        {
          onSuccess: (log: IActivityLog) => {
            setSent({ hours: Number(activityLog.hours) || 0 });
            haptics.success();
            timer.current = setTimeout(() => {
              timer.current = null;
              dismiss();
              onSent?.(log);
            }, SUCCESS_DWELL_MS);
          },
          onError: (error: any) => {
            haptics.error();
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.ACTIVITY_LOG_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            });
          },
        },
      );
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          style={[props.style, styles.scrim]}
          opacity={1}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          // changed fields: a tap on the scrim asks instead of closing
          pressBehavior={guarded ? 'collapse' : 'close'}
          onPress={guarded ? requestClose : undefined}
          accessibilityLabel={`${t('general:close')}`}
        />
      ),
      [guarded, requestClose, t],
    );

    const footerStyle = useAnimatedStyle(
      () => ({ opacity: withTiming(sent ? 0 : 1, { duration: duration.exit }) }),
      [sent],
    );
    const footer = (
      <Animated.View style={footerStyle} pointerEvents={sent ? 'none' : 'auto'}>
        <Button
          label={`${t('submit')} →`}
          accessibilityLabel={`${t('submit')}`}
          onPress={handleSubmit(onSubmit)}
          loading={isLoggingHours}
          disabled={isLoggingHours || !!sent}
          full
          testID="hours-submit"
        />
      </Animated.View>
    );

    const title = `${t('activity_logs:add')}`;
    // `.shead h4` Bricolage 30 on a 30pt line, trimmed so Ă is not cut (design/components/Text)
    const titleTrim = tight(30, 1, useEffectiveFontScale(fontScaleCap.display));

    return (
      <Sheet
        ref={sheetRef}
        variant="form"
        scroll={false}
        showClose={false}
        footer={footer}
        animatedPosition={animatedPosition}
        enablePanDownToClose={!guarded && !isLoggingHours}
        backdropComponent={renderBackdrop}
        // `.done` covers the whole sheet, grabber included
        {...(sent ? { handleIndicatorStyle: styles.grabberHidden } : {})}
        accessibilityLabel={title}
        onDismiss={() => {
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
          }
          setMounted(false);
          setSent(null);
        }}
      >
        {mounted && (
          <View style={styles.fill} testID="hours-add-sheet">
            <View style={styles.header}>
              <Text
                accessibilityRole="header"
                maxFontSizeMultiplier={fontScaleCap.display}
                style={[styles.title, titleTrim]}
                numberOfLines={2}
              >
                {title}
              </Text>
              <Pressable
                onPress={requestClose}
                style={({ pressed }) => [styles.close, pressed ? styles.closePressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`${t('general:close')}`}
                hitSlop={4}
                testID="hours-add-sheet-close"
              >
                <CloseIcon size={20} color={palette.navy} strokeWidth={ICON_STROKE + 0.4} />
              </Pressable>
            </View>
            <BottomSheetScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.body}
              onContentSizeChange={revealMentions}
            >
              <ActivityLogForm
                inSheet
                isLoading={isLoggingHours}
                control={control}
                errors={errors}
                onMentionsFocus={onMentionsFocus}
                onMentionsBlur={onMentionsBlur}
              />
              <Animated.View style={keyboardSpacer} />
            </BottomSheetScrollView>
            {!!sent && (
              <SubmitSuccess
                title={`${t('success.title')}`}
                description={`${t('success.description', {
                  count: sent.hours,
                  name: organization?.name ?? '',
                })}`}
                testID="hours-sent"
              />
            )}
          </View>
        )}
      </Sheet>
    );
  },
);

AddHoursSheet.displayName = 'AddHoursSheet';

export default AddHoursSheet;

const styles = StyleSheet.create((theme) => ({
  fill: { flex: 1 },
  grabberHidden: { width: 42, height: 5, opacity: 0 },
  scrim: { backgroundColor: theme.colors.scrim },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: theme.space.gutter,
  },
  // `.shead h4`: Bricolage 800 30 beside the 46pt close
  title: {
    flex: 1,
    fontFamily: theme.fontFamily.display,
    includeFontPadding: false,
    letterSpacing: -1.05,
    color: theme.colors.ink,
  },
  close: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { transform: [{ scale: 0.94 }] },
  body: {
    paddingHorizontal: theme.space.gutter,
    paddingTop: 4,
    paddingBottom: 24,
    // `.sbody` gap 14
    gap: 14,
  },
}));
