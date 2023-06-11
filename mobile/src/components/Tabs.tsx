import React, { useState } from 'react';
import HorizontalCarousel from './HorizontalCarousel';
import { Button, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { ISelectItem } from './FormSelect';
import { View } from 'react-native';

interface TabsProps {
  tabs: ISelectItem[];
  defaultTab?: ISelectItem;
  onPress: (id: string | number) => void;
}

const Tabs = ({ tabs, onPress, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<ISelectItem>(defaultTab || tabs[0]);
  const styles = useStyleSheet(themedStyles);

  const onTabClick = (selected: ISelectItem): void => {
    setActiveTab(selected);
    onPress(selected.key);
  };

  return (
    <View style={styles.container}>
      <HorizontalCarousel>
        {tabs.map((tab) => {
          const isTabActive = activeTab.key === tab.key;
          return (
            <Button
              key={tab.key}
              appearance="ghost"
              status="basic"
              style={[styles.tab, isTabActive ? styles.activeTabBgc : null]}
              onPress={onTabClick.bind(null, tab)}
            >
              {() => (
                <Text
                  category={isTabActive ? 's1' : 'c1'}
                  appearance={isTabActive ? 'default' : 'hint'}
                >
                  {tab.label}
                </Text>
              )}
            </Button>
          );
        })}
      </HorizontalCarousel>
    </View>
  );
};

export default Tabs;

const themedStyles = StyleService.create({
  container: { marginBottom: 12 },
  activeTabBgc: { backgroundColor: '$cool-gray-100' },
  tab: { borderRadius: 6, paddingHorizontal: 12 },
});
