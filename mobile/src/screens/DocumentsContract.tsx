import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { Text, useTheme } from '@ui-kitten/components';
import { DocumentContract } from '../services/documents/documents.api';
import { DocumentContractStatus } from '../common/enums/document-contract-status.enum';
import Disclaimer from '../components/Disclaimer';
import { useUserProfile } from '../store/profile/profile.selector';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ContractItem from '../components/ContractItem';
import { DocumentIcon } from './Documents';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignatureViewRef } from 'react-native-signature-canvas';
import {
  useGetContractQuery,
  useSignContractMutation,
} from '../services/documents/documents.service';

import { isAfter } from 'date-fns';
import {
  isOver16FromCNP,
  mapContractToColor,
  renderContractInfoText,
} from '../common/utils/document-contracts.helpers';
import { useQueryClient } from 'react-query';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';

import { SignatureBottomSheet } from '../components/SignatureBottomSheet';

export const DocumentsContract = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents-contract');
  const paddingTop = usePaddingTop();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { userProfile } = useUserProfile();
  const queryClient = useQueryClient();

  // state
  const [displayLegalGuardianScreen, setDisplayLegalGuardianScreen] = useState(false);
  const [isFinishedSigning, setIsFinishedSigning] = useState({
    isFinished: false,
    isSuccessful: false,
  });
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(false);

  // queries
  const { contract: routeContract } = route.params as { contract: DocumentContract };
  const { data: contract, isLoading: isLoadingContract } = useGetContractQuery(
    routeContract.documentId,
    userProfile?.activeOrganization?.id,
  );
  const { mutate: signContract, isLoading: isLoadingSignContract } = useSignContractMutation();

  const isUserOver16 = useMemo(
    () => isOver16FromCNP(userProfile ? userProfile?.userPersonalData.cnp : ''),
    [userProfile],
  );
  const isContractActive = useMemo(
    () =>
      contract &&
      contract.status === DocumentContractStatus.APPROVED &&
      isAfter(new Date(), new Date(contract.documentStartDate)) &&
      isAfter(new Date(contract.documentEndDate), new Date()),
    [contract],
  );

  // ref to save the volunteer signature value
  const volunteerSignatureValue = useRef<string | null>(null);

  // signature component refs
  const volunteerSignatureRef = useRef<SignatureViewRef>(null);
  const legalGuardianSignatureRef = useRef<SignatureViewRef>(null);

  // bottom sheet
  const snapPoints = useMemo(
    () => (isFinishedSigning.isFinished ? [1, 550] : isLoadingSignContract ? [1, 350] : [1, 700]),
    [isFinishedSigning, isLoadingSignContract],
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = () => {
    return bottomSheetRef.current?.expand();
  };
  const onCloseBottomSheet = () => {
    return bottomSheetRef.current?.close();
  };

  const handleClearVolunteerSignature = () => {
    volunteerSignatureRef.current?.clearSignature();
  };
  const handleClearLegalGuardianSignature = () => {
    legalGuardianSignatureRef.current?.clearSignature();
  };

  const readVolunteerSignature = () => {
    if (volunteerSignatureRef.current) {
      volunteerSignatureRef.current.readSignature();
      // now the handleOK will be called by default
    }
  };

  const handleEmptySignature = () => {
    setIsSignatureEmpty(true);
  };

  const handleEndStroke = () => {
    setIsSignatureEmpty(false);
  };

  const readLegalGuardianSignature = () => {
    if (legalGuardianSignatureRef.current) {
      legalGuardianSignatureRef.current.readSignature();
      // now the handleOK will be called by default
    }
  };

  const onSaveVolunteerSignature = (signature: string) => {
    // save volunteer signature
    volunteerSignatureValue.current = signature;
    // reset signature pad
    handleClearVolunteerSignature();
    // show legal guardian signature screen
    setDisplayLegalGuardianScreen(true);
  };

  const onSubmitVolunteerSignature = (signature: string) => {
    signContract(
      {
        contractId: contract ? contract.documentId : '',
        payload: {
          organizationId:
            userProfile && userProfile.activeOrganization && userProfile.activeOrganization.id,
          volunteerSignatureBase64: signature,
          legalGuardianSignatureBase64: null,
        },
      },
      {
        onSuccess: () => {
          setIsFinishedSigning({ isFinished: true, isSuccessful: true });
        },
        onError: () => {
          setIsFinishedSigning({ isFinished: true, isSuccessful: false });
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: [
              'contract',
              'contractId',
              contract ? contract.documentId : '',
              'organizationId',
              userProfile?.activeOrganization?.id,
            ],
          });
        },
      },
    );
  };

  const onSubmitBothSignatures = (signature: string) => {
    const payload = {
      organizationId:
        userProfile && userProfile.activeOrganization && userProfile.activeOrganization.id,
      volunteerSignatureBase64: volunteerSignatureValue.current,
      legalGuardianSignatureBase64: signature,
    };
    signContract(
      {
        contractId: contract && contract.documentId,
        payload,
      },
      {
        onSuccess: () => {
          setIsFinishedSigning({ isFinished: true, isSuccessful: true });
        },
        onError: () => {
          setIsFinishedSigning({ isFinished: true, isSuccessful: false });
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: [
              'contract',
              'contractId',
              contract ? contract.documentId : '',
              'organizationId',
              userProfile?.activeOrganization?.id,
            ],
          });
        },
      },
    );
  };

  const handleRejectContract = () => {
    navigation.navigate('documents/contract/reject', { contract });
  };

  if (isLoadingContract) {
    return (
      <PageLayout
        onBackButtonPress={navigation.goBack}
        title={t('contract.title', { value: routeContract.documentNumber })}
        headerStyle={{ paddingTop }}
      >
        <View style={styles.container}>
          {userProfile?.activeOrganization && (
            <OrganizationIdentity
              name={userProfile?.activeOrganization.name}
              uri={userProfile?.activeOrganization?.logo || ''}
            />
          )}
          <DocumentSkeletonList />
        </View>
      </PageLayout>
    );
  }

  // TODO: download contract functionality

  const getActionOptions = () => {
    if (contract?.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE) {
      return {
        primaryActionLabel: t('contract.sign'),
        onPrimaryActionButtonClick: openBottomSheet,
        secondaryActionLink: t('contract.reject'),
        onSecondaryActionButtonClick: handleRejectContract,
      };
    }
  };

  if (contract) {
    const { color, backgroundColor, info } = mapContractToColor(contract, t);
    return (
      <>
        <PageLayout
          onBackButtonPress={navigation.goBack}
          actionsOptions={getActionOptions()}
          title={t('contract.title', { value: contract.documentNumber })}
          headerStyle={{ paddingTop }}
        >
          {contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE && (
            <Disclaimer color="yellow" text={t('requires_volunteer_signature')} />
          )}
          {(contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
            contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE) && (
            <Disclaimer color="yellow" text={t('requires_ngo_signature')} />
          )}
          {isContractActive && <Disclaimer color="turquoise" text={t('approved')} />}

          <View style={styles.container}>
            {userProfile?.activeOrganization && (
              <OrganizationIdentity
                name={userProfile?.activeOrganization.name}
                uri={userProfile?.activeOrganization?.logo || ''}
              />
            )}
            <Text category="p1">{renderContractInfoText(contract, t)}</Text>

            <ContractItem
              id={contract.documentId}
              title={contract.documentNumber}
              leftIcon={<DocumentIcon color={color} backgroundColor={backgroundColor} />}
              // leftIcon={<DocumentIcon color={'yellow'} backgroundColor={'yellow'} />}
              startDate={contract.documentStartDate}
              endDate={contract.documentEndDate}
              onPress={() => {
                if (contract.documentFilePath) {
                  Linking.openURL(contract.documentFilePath);
                }
              }}
              // todo: download contract
              //   onPress={() => onContractPress(item)}
              info={info}
            />

            {/* footer for pending signature from ngo */}
            {(contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
              contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE) && (
              <View
                style={[
                  styles.buttonsContainer,
                  { paddingBottom: insets.bottom + 16, borderColor: theme['cool-gray-300'] },
                ]}
              >
                <Text
                  category="p1"
                  appearance="hint"
                  style={styles.text}
                >{`${t('contract.signed_contract_footer')}`}</Text>
              </View>
            )}
          </View>
        </PageLayout>
        <SignatureBottomSheet
          bottomSheetRef={bottomSheetRef}
          snapPoints={snapPoints}
          isFinishedSigning={isFinishedSigning}
          displayLegalGuardianScreen={displayLegalGuardianScreen}
          isLoadingSignContract={isLoadingSignContract}
          volunteerSignatureRef={volunteerSignatureRef}
          onSubmitVolunteerSignature={onSubmitVolunteerSignature}
          onSaveVolunteerSignature={onSaveVolunteerSignature}
          isUserOver16={isUserOver16}
          handleEndStroke={handleEndStroke}
          handleClearVolunteerSignature={handleClearVolunteerSignature}
          handleEmptySignature={handleEmptySignature}
          readVolunteerSignature={readVolunteerSignature}
          onCloseBottomSheet={onCloseBottomSheet}
          isSignatureEmpty={isSignatureEmpty}
          legalGuardianSignatureRef={legalGuardianSignatureRef}
          onSubmitBothSignatures={onSubmitBothSignatures}
          handleClearLegalGuardianSignature={handleClearLegalGuardianSignature}
          readLegalGuardianSignature={readLegalGuardianSignature}
        />
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    marginBottom: -8,
  },
  text: {
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 16,
    padding: 24,
    marginTop: 'auto',
    shadowColor: 'gray',
    marginHorizontal: -16,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  inlineLink: { color: 'black' },
});
