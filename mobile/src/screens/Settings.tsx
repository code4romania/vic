import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import { Image, ScrollView, StyleSheet, View, TouchableHighlight } from 'react-native';
//SVG
import { SvgXml } from 'react-native-svg';
import { SETTING_SCREENS } from '../common/constants/setting-screens';

const Settings = ({ navigation }: any) => {
  console.log('Settings');

  const navigateTo = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <PageLayout title="Settings">
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: 'https://picsum.photos/200/300' }} style={styles.image} />
            <Text category="h2" appearance="hint">
              Andreea Popa
            </Text>
          </View>
          <View>
            {SETTING_SCREENS.map((screen, index) => (
              <TouchableHighlight
                onPress={() => navigateTo(screen.route)}
                activeOpacity={1}
                underlayColor="#F9F9F9"
              >
                <View
                  key={screen.label}
                  style={[
                    styles.screen,
                    index === SETTING_SCREENS.length - 1 ? {} : styles.borderBottom,
                  ]}
                >
                  <View style={styles.iconWrapper}>
                    <SvgXml xml={screen.icon} />
                  </View>
                  <Text category="label" appearance="hint">
                    {screen.label}
                  </Text>
                </View>
              </TouchableHighlight>
            ))}
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  image: { width: 48, height: 48, borderRadius: 100 },
  profileContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
});
