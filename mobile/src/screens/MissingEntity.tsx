import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Layout, Text } from '@ui-kitten/components';
import Button from '../components/Button';
import SadFaceSvg from '../assets/svg/sad-face';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface MissingEntityProps {
  heading: string;
  paragraph: string;
  actionBtnLabel: string;
  onActionBtnPress: () => void;
}

const MissingEntity = ({
  onActionBtnPress,
  heading,
  paragraph,
  actionBtnLabel,
}: MissingEntityProps) => {
  console.log('No Volunteer Profile');

  return (
    <PageLayout title="">
      <Layout style={styles.container}>
        <SvgXml xml={SadFaceSvg} style={styles.svg} />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={styles.noOrgAdded}>
          {heading}
        </Text>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.description} appearance="hint">
          {paragraph}
        </Text>
        <Button label={actionBtnLabel} onPress={onActionBtnPress} />
      </Layout>
    </PageLayout>
  );
};

export default MissingEntity;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    marginBottom: 50,
  },
  noOrgAdded: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 28,
    textAlign: 'center',
  },
});
