import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PageLayout from '../layouts/PageLayout';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { Text, useTheme } from '@ui-kitten/components';
import { useUserProfile } from '../store/profile/profile.selector';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import FormSelect from '../components/FormSelect';
import { DocumentContract, RejectionReason } from '../services/documents/documents.api';
import { useRejectContractMutation } from '../services/documents/documents.service';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { renderBackdrop } from '../components/BottomSheet';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import successIcon from '../assets/svg/success-icon';
import InlineLink from '../components/InlineLink';
import Button from '../components/Button';
import { useQueryClient } from 'react-query';

const rejectionOptionsArray = [
  { key: RejectionReason.INCORRECT_IDENTITY_DATA, label: 'Datele de identitate nu sunt corecte' },
  { key: RejectionReason.DONT_AGREE_WITH_CLAUSES, label: 'Nu sunt de acord cu clauzele' },
  { key: RejectionReason.WRONG_CONTRACT_PERIOD, label: 'Perioada contractului este greșită' },
  { key: RejectionReason.OTHER, label: 'Alt motiv' },
];

interface FieldValues {
  rejectionReason: RejectionReason;
}

export const RejectContract = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents-contract');
  const paddingTop = usePaddingTop();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const queryClient = useQueryClient();

  const { userProfile } = useUserProfile();
  const { contract } = route.params as { contract: DocumentContract };

  const [bottomSheetContent, setBottomSheetContent] = useState<{
    description: string;
    action: (() => void) | null;
  }>({
    description: `${t('reject.sheet.description')}`,
    action: null,
  });

  const { mutate: rejectContract, isLoading: isLoadingRejectContract } =
    useRejectContractMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<FieldValues>();

  const onSubmit = (formData: FieldValues) => {
    const rejectPayload = {
      contractId: contract.documentId,
      organizationId: userProfile?.activeOrganization?.id,
      reason: formData.rejectionReason,
    };
    rejectContract(rejectPayload, {
      // todo: onSuccess
      onSuccess: () => {
        if (rejectPayload.reason === RejectionReason.INCORRECT_IDENTITY_DATA) {
          setBottomSheetContent({
            description: `${t('reject.sheet.identity.description')}`,
            action: () => {
              // pop the current screen from the stack -> we do this in order to navigate back to the contract screen instead of the rejection screen when coming back from completing identity data
              navigation.pop();
              navigation.navigate('identity-data');
              onCloseBottomSheet();
            },
          });
        }
        openBottomSheet();
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ['contracts', userProfile?.activeOrganization?.volunteerId],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'contract',
            'contractId',
            contract.documentId,
            'organizationId',
            userProfile?.activeOrganization?.id,
          ] as const,
        });
      },
    });
  };

  // bottom sheet
  const snapPoints = useMemo(() => [1, 500], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const openBottomSheet = () => {
    return bottomSheetRef.current?.expand();
  };
  const onCloseBottomSheet = () => {
    return bottomSheetRef.current?.close();
  };

  return (
    <>
      <PageLayout
        onBackButtonPress={navigation.goBack}
        headerStyle={{ paddingTop }}
        title={t('reject.title')}
        actionsOptions={{
          onPrimaryActionButtonClick: handleSubmit(onSubmit),
          primaryActionLabel: t('reject.send'),
          loading: isLoadingRejectContract,
        }}
      >
        <View style={styles.container}>
          {userProfile?.activeOrganization && (
            <OrganizationIdentity
              name={userProfile?.activeOrganization.name}
              uri={userProfile?.activeOrganization?.logo || ''}
            />
          )}
          <Text appearance="hint">{`${t('reject.description')}`}</Text>
          <FormSelect
            control={control as any}
            controllerRules={{ required: true }}
            name="rejectionReason"
            label={t('reject.reason')}
            error={errors.rejectionReason}
            placeholder={t('general:select')}
            options={rejectionOptionsArray}
            disabled={isLoadingRejectContract}
            required
          />
        </View>
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        animateOnMount={reducedMotion ? false : true}
        enableContentPanningGesture={false}
      >
        <BottomSheetView style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom }]}>
          <SvgXml xml={successIcon} height={100} width={100} />
          <Text style={styles.text} category="h1">{`${t('reject.sheet.title')}`}</Text>
          <Text style={styles.text} appearance="hint" category="p1">
            {bottomSheetContent.description}
          </Text>
          {bottomSheetContent.action && (
            <Button
              label={t('reject.sheet.identity.action_btn_label')}
              onPress={bottomSheetContent.action}
            />
          )}
          <InlineLink
            label={t('reject.sheet.close')}
            style={{ color: theme['cool-gray-700'] }}
            onPress={() => {
              onCloseBottomSheet();
              navigation.navigate('documents/contracts');
              setBottomSheetContent({
                description: `${t('reject.sheet.description')}`,
                action: () => null,
              });
            }}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  text: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginTop: 'auto',
    padding: 24,
    marginHorizontal: -16,
    borderTopWidth: 1,
  },
  bottomSheetContainer: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
});
