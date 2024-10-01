import React, { useEffect, useMemo, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Animated, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignatureScreen } from './SignatureScreen';
import { useTranslation } from 'react-i18next';
import successIcon from '../assets/svg/success-icon';
import { SvgXml } from 'react-native-svg';
import { Text, useTheme } from '@ui-kitten/components';
import InlineLink from './InlineLink';
import upsIcon from '../assets/svg/ups-icon';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { SignatureViewRef } from 'react-native-signature-canvas';
import LottieView from 'lottie-react-native';
import { renderBackdrop } from './BottomSheet';
interface SignatureBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  snapPoints: number[];
  isFinishedSigning: {
    isFinished: boolean;
    isSuccessful: boolean;
  };
  displayLegalGuardianScreen: boolean;
  isLoadingSignContract: boolean;
  volunteerSignatureRef: React.RefObject<SignatureViewRef>;
  onSubmitVolunteerSignature: (signature: string) => void;
  onSaveVolunteerSignature: (signature: string) => void;
  isUserOver16: boolean;
  handleEndStroke: () => void;
  handleClearVolunteerSignature: () => void;
  handleEmptySignature: () => void;
  readVolunteerSignature: () => void;
  onCloseBottomSheet: () => void | undefined;
  isSignatureEmpty: boolean;
  legalGuardianSignatureRef: React.RefObject<SignatureViewRef>;
  onSubmitBothSignatures: (signature: string) => void;
  handleClearLegalGuardianSignature: () => void;
  readLegalGuardianSignature: () => void;
}
const LoadingScreen = () => {
  const { t } = useTranslation('documents-contract');
  const theme = useTheme();
  const loadingTexts = useMemo(
    () => [
      `${t('loading_signature.processing_signature')}`,
      `${t('loading_signature.applying_signature')}`,
      `${t('loading_signature.processing_document')}`,
    ],
    [t],
  );
  const [currentText, setCurrentText] = useState(loadingTexts[0]);
  const [fadeAnim] = useState(new Animated.Value(1));

  // changing text animation
  // 1. fade out current text
  // 2. change text
  // 3. fade in new text
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      Animated.sequence([
        // fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // change displayed text
        setCurrentText(loadingTexts[(index + 1) % loadingTexts.length]);
        // start fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
        index = (index + 1) % loadingTexts.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingTexts, fadeAnim]);

  return (
    <View style={styles.loadingScreen}>
      <Text style={styles.text} category="h1">
        {`${t('loading_signature.title')}`}
      </Text>
      <LottieView
        source={require('../assets/animations/loading-document.json')}
        autoPlay
        loop
        style={styles.lottieDocumentLoader}
      />
      <Animated.Text
        style={[
          {
            opacity: fadeAnim,
            color: theme['cool-gray-500'],
          },
          styles.animatedText,
        ]}
      >
        {currentText}
      </Animated.Text>
    </View>
  );
};

export const SignatureBottomSheet = ({
  bottomSheetRef,
  snapPoints,
  isFinishedSigning,
  displayLegalGuardianScreen,
  isLoadingSignContract,
  volunteerSignatureRef,
  onSubmitVolunteerSignature,
  onSaveVolunteerSignature,
  isUserOver16,
  handleEndStroke,
  handleClearVolunteerSignature,
  handleEmptySignature,
  readVolunteerSignature,
  onCloseBottomSheet,
  isSignatureEmpty,
  legalGuardianSignatureRef,
  onSubmitBothSignatures,
  handleClearLegalGuardianSignature,
  readLegalGuardianSignature,
}: SignatureBottomSheetProps) => {
  const { t } = useTranslation('documents-contract');
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const renderUncloseableBackdrop = (props: any) => {
    return <BottomSheetBackdrop opacity={0.3} pressBehavior="none" {...props} />;
  };

  return (
    <BottomSheet
      backdropComponent={isLoadingSignContract ? renderUncloseableBackdrop : renderBackdrop}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      animateOnMount={reducedMotion ? false : true}
      enableContentPanningGesture={false}
      enablePanDownToClose={!isLoadingSignContract}
      enableHandlePanningGesture={!isLoadingSignContract}
      handleComponent={isLoadingSignContract ? null : BottomSheetHandle}
    >
      <BottomSheetView style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom }]}>
        {!isFinishedSigning.isFinished ? (
          !displayLegalGuardianScreen ? (
            isLoadingSignContract ? (
              <LoadingScreen />
            ) : (
              // FIRST SCREEN - VOLUNTEER SIGNATURE
              <SignatureScreen
                title={t('volunteer_signature.title')}
                description={t('volunteer_signature.description')}
                signatureRef={volunteerSignatureRef}
                onOK={isUserOver16 ? onSubmitVolunteerSignature : onSaveVolunteerSignature}
                onEnd={handleEndStroke}
                handleClear={handleClearVolunteerSignature}
                handleEmpty={handleEmptySignature}
                terms={t('volunteer_signature.terms')}
                actionButtonLabel={
                  isUserOver16 ? t('volunteer_signature.send') : t('volunteer_signature.apply')
                }
                onAction={readVolunteerSignature}
                onClose={() => {
                  onCloseBottomSheet();
                  handleClearVolunteerSignature();
                }}
                isError={isSignatureEmpty}
              />
            )
          ) : isLoadingSignContract ? (
            <LoadingScreen />
          ) : (
            // SECOND SCREEN - LEGAL GUARDIAN SIGNATURE
            <SignatureScreen
              title={`${t('legal_guardian_signature.title')}`}
              description={`${t('legal_guardian_signature.description', { value: 'Ion Popescu' })}`}
              signatureRef={legalGuardianSignatureRef}
              onOK={onSubmitBothSignatures}
              onEnd={handleEndStroke}
              handleClear={handleClearLegalGuardianSignature}
              handleEmpty={handleEmptySignature}
              terms={`${t('legal_guardian_signature.terms')}`}
              actionButtonLabel={`${t('legal_guardian_signature.action_button_label')}`}
              onAction={readLegalGuardianSignature}
              onClose={() => {
                onCloseBottomSheet();
                handleClearLegalGuardianSignature();
              }}
              isError={isSignatureEmpty}
            />
          )
        ) : isFinishedSigning.isSuccessful ? (
          // CONTRACT SIGNED SUCCESSFULLY
          <>
            <SvgXml xml={successIcon} height={100} width={100} />
            <Text style={styles.text} category="h1">{`${t('success.title')}`}</Text>
            <Text style={styles.text} category="p1" appearance="hint">
              {`${t('success.description')}`}
            </Text>
            <InlineLink
              label={t('general:back')}
              style={{ color: theme['cool-gray-700'] }}
              onPress={onCloseBottomSheet}
            />
          </>
        ) : (
          // ERROR WHILE SIGNING
          <>
            <SvgXml xml={upsIcon} height={100} width={100} />
            <Text style={styles.text} category="h1">{`${t('error.title')}`}</Text>
            <Text style={styles.text} category="p1" appearance="hint">
              {`${t('error.description')}`}
            </Text>
            <InlineLink
              label={t('general:back')}
              style={{ color: theme['cool-gray-700'] }}
              onPress={onCloseBottomSheet}
            />
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  animatedText: { fontFamily: 'roboto-regular', fontSize: 16, fontWeight: '400' },
  bottomSheetContainer: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingScreen: {
    flex: 1,
    width: '100%',
    // justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'pink',
  },
  lottieDocumentLoader: {
    width: 150,
    height: 150,
  },
});
