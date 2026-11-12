// Haptics only on actions with an effect (selection, submit, error), never on scroll.
import * as Haptics from 'expo-haptics';

const safe = (fn: () => Promise<void>) => {
  fn().catch(() => undefined);
};

export const haptics = {
  /** tab change, segmented, stepper, quick options */
  selection: () => safe(() => Haptics.selectionAsync()),
  /** open a sheet, open an event */
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** submit succeeded, toast */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** validation error */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
} as const;

export default haptics;
