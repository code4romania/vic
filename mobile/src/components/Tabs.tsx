import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';
import HorizontalCarousel from './HorizontalCarousel';
import { Button, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { ISelectItem } from './FormSelect';

interface TabsProps {
  tabs: ISelectItem[];
  defaultTab?: ISelectItem;
  children: ReactNode;
  onClick: (id: string | number) => void;
}

const Tabs = ({ children, tabs, onClick, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<ISelectItem>(defaultTab || tabs[0]);
  const styles = useStyleSheet(themedStyles);

  const onTabClick = (selected: ISelectItem): void => {
    setActiveTab(selected);
    onClick(selected.key);
  };

  return (
    <View style={styles.container}>
      <View>
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
      {children}
    </View>
  );
};

export default Tabs;

const themedStyles = StyleService.create({
  activeTabBgc: { backgroundColor: '$cool-gray-100' },
  tab: { borderRadius: 6, paddingHorizontal: 12 },
  container: { gap: 21 },
});
