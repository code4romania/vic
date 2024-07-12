import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import {
  useCancelContractMutation,
  useContractQuery,
  useSignContractMutation,
} from '../services/contract/contract.service';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer';
import { ContractStatus } from '../common/enums/contract-status.enum';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import { Text, useTheme } from '@ui-kitten/components';
import { Platform, StyleSheet, View } from 'react-native';
import ContractItem from '../components/ContractItem';
import { DocumentIcon } from './Documents';
import { ButtonType } from '../common/enums/button-type.enum';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING, MIME_TYPES } from '../common/constants/constants';
import ContractSkeleton from '../components/skeleton/contract-skeleton';
import BottomSheet from '@gorhom/bottom-sheet';
import { renderBackdrop } from '../components/BottomSheet';
import Button from '../components/Button';
import InlineLink from '../components/InlineLink';
import { useReducedMotion } from 'react-native-reanimated';

const Contract = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  // contract param
  const { id } = route.params;
  // theme
  const theme = useTheme();
  // document state
  const [selectedContract, setSelectedContract] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  // active organization
  const { userProfile } = useUserProfile();
  // contract request
  const {
    data: contract,
    isFetching: isLoadingContract,
    error: getContractError,
  } = useContractQuery(id);

  const reducedMotion = useReducedMotion();

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 300], []);

  // sign contract
  const { mutate: signContract, isLoading: isUploadingContract } = useSignContractMutation();
  // cancel contract
  const { mutate: cancelContract, isLoading: isCancelingContract } = useCancelContractMutation();

  useEffect(() => {
    // go back and show error
    if (getContractError) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.CONTRACT_ERRORS.getError(
          (getContractError as any).response?.data.code_error,
        )}`,
      });
      navigation.goBack();
    }
  }, [getContractError, navigation]);

  const onDownloadContract = async () => {
    if (contract) {
      let LocalPath = FileSystem.documentDirectory + contract.contractFileName;
      const file = await FileSystem.downloadAsync(contract?.path, LocalPath);
      save(
        file.uri,
        contract.contractFileName,
        MIME_TYPES[contract.contractFileName.split('.')[1]] as string,
      );
    }
  };

  const save = async (uri: string, fileName: string, mimetype: string) => {
    if (Platform.OS === 'android' && Platform.Version >= 30) {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimetype,
        )
          .then(async (resultUri) => {
            await FileSystem.writeAsStringAsync(resultUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch(console.log);
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };

  const onSelectContract = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [MIME_TYPES.doc, MIME_TYPES.docx, MIME_TYPES.pdf],
    });
    // don't show the bottom sheet if the user canceled the upload file from the device
    if (!result.canceled && result.assets[0]) {
      setSelectedContract(result.assets[0] as any);
      onOpenBottomSheet();
    }
  };

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const onOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const onCancelSelection = async () => {
    onCloseBottomSheet();
    setSelectedContract(null);
  };

  const onUploadContract = async () => {
    if (selectedContract) {
      signContract(
        { contractId: id, contract: selectedContract },
        {
          onSuccess: () => {
            // show success toast and get back to the previous page and update state
            Toast.show({ text1: `${t('contract.upload.success')}`, type: 'success' });
            navigation.goBack();
          },
          onError: (error) => {
            Toast.show({
              text1: `${InternalErrors.CONTRACT_ERRORS.getError(
                (error as any).response?.data.code_error,
              )}`,
              type: 'error',
            });
          },
        },
      );
    }
  };

  const onCancelAndUploadNewContract = () => {
    cancelContract(
      { contractId: id },
      {
        onSuccess: () => {
          // show success toast and get back to the previous page and update state
          Toast.show({ text1: `${t('contract.cancel.success')}`, type: 'success' });
          navigation.goBack({ shouldRefetch: true });
        },
        onError: (error) => {
          Toast.show({
            text1: `${InternalErrors.CONTRACT_ERRORS.getError(
              (error as any).response?.data.code_error,
            )}`,
            type: 'error',
          });
        },
      },
    );
  };

  const buildPageActions = () => {
    if (contract?.status === ContractStatus.PENDING_VOLUNTEER) {
      return {
        onPrimaryActionButtonClick: onSelectContract,
        primaryActionLabel: t('contract.actions.upload'),
        primaryBtnType: ButtonType.PRIMARY,
        loading: isUploadingContract,
      };
    }

    if (contract?.status === ContractStatus.PENDING_ADMIN) {
      return {
        onPrimaryActionButtonClick: onCancelAndUploadNewContract,
        primaryActionLabel: t('contract.actions.cancel'),
        primaryBtnType: ButtonType.DANGER,
        loading: isCancelingContract,
      };
    }
  };

  return (
    <>
      <PageLayout
        title={t('contract.title', { contractNumber: contract?.contractNumber || '' })}
        onBackButtonPress={navigation.goBack}
        actionsOptions={buildPageActions()}
      >
        {isLoadingContract && <ContractSkeleton />}
        {!isLoadingContract && contract && (
          <>
            {(contract.status === ContractStatus.PENDING_ADMIN ||
              contract.status === ContractStatus.PENDING_VOLUNTEER) && (
              <Disclaimer color="yellow" text={t(`contract.disclaimer.${contract.status}`)} />
            )}
            <FormLayout>
              {userProfile?.activeOrganization && (
                <OrganizationIdentity
                  name={userProfile?.activeOrganization.name}
                  uri={userProfile?.activeOrganization.logo || ''}
                />
              )}
              <Text
                allowFontScaling={ALLOW_FONT_SCALLING}
                category="p1"
                style={styles.paragraph}
              >{`${t(`contract.paragraph.${contract.status}`)}`}</Text>
              <ContractItem
                id={contract.id}
                title={contract.contractNumber}
                startDate={contract.startDate}
                endDate={contract.endDate}
                leftIcon={<DocumentIcon color="yellow-500" backgroundColor="yellow-50" />}
                onPress={onDownloadContract}
              />
            </FormLayout>
          </>
        )}
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.textContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">{`${t(
              'contract.bottom_sheet.heading',
            )}`}</Text>
            <View style={styles.bottomSheetParagraphContainer}>
              <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">{`${t(
                'contract.bottom_sheet.paragraph',
              )}`}</Text>
              <Text
                allowFontScaling={ALLOW_FONT_SCALLING}
                category="p2"
                style={{ color: theme['color-success-500'] }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {(selectedContract as any)?.name || ''}
              </Text>
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            <Button label={t('contract.bottom_sheet.label')} onPress={onUploadContract} />
            <InlineLink
              style={{ color: theme['cool-gray-700'] }}
              label={t('general:back')}
              onPress={onCancelSelection}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default Contract;

const styles = StyleSheet.create({
  paragraph: {
    lineHeight: 24,
  },
  bottomSheetParagraphContainer: {
    paddingVertical: 8,
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 24,
  },
  textContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonsContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
