import React, { useEffect, useState } from 'react';
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
import { PendingContractIcon } from './Documents';
import { ButtonType } from '../common/enums/button-type.enum';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import useStore from '../store/store';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING, MIME_TYPES } from '../common/constants/constants';
import ContractSkeleton from '../components/skeleton/contract-skeleton';

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
  // bottom sheet state
  const { open: openBottomSheet, close: closeBottomSheet } = useStore();
  // contract request
  const {
    data: contract,
    isFetching: isLoadingContract,
    error: getContractError,
  } = useContractQuery(id);

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
      openBottomSheet();
    }
  };

  const onCancelSelection = async () => {
    closeBottomSheet();
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
    <PageLayout
      title={t('contract.title', { contractNumber: contract?.contractNumber || '' })}
      onBackButtonPress={navigation.goBack}
      actionsOptions={buildPageActions()}
      bottomSheetOptions={{
        paragraph: (
          <View style={styles.bottomSheetParagraphContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">{`${t(
              'contract.bottom_sheet.paragraph',
            )}`}</Text>
            <Text
              allowFontScaling={ALLOW_FONT_SCALLING}
              category="p2"
              style={{ color: theme['color-success-500'] }}
            >
              {(selectedContract as any)?.name || ''}
            </Text>
          </View>
        ),
        heading: t('contract.bottom_sheet.heading'),
        primaryAction: {
          label: t('contract.bottom_sheet.label'),
          onPress: onUploadContract,
        },
        secondaryAction: {
          label: t('general:back'),
          onPress: onCancelSelection,
        },
      }}
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
              leftIcon={<PendingContractIcon />}
              onPress={onDownloadContract}
            />
          </FormLayout>
        </>
      )}
    </PageLayout>
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
  },
});
