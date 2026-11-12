import React, { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import HorizontalCarousel from './HorizontalCarousel';
import { ISelectItem } from './FormSelect';
import { OptionChip } from '../design/components/Chip';
import { haptics } from '../design/haptics';

interface TabsProps {
  tabs: ISelectItem[];
  defaultTab?: ISelectItem;
  onPress: (id: string | number) => void;
}

/** A row of option chips that scrolls sideways; the selected one is navy. */
const Tabs = ({ tabs, onPress, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<ISelectItem>(defaultTab || tabs[0]);

  const onTabClick = (selected: ISelectItem): void => {
    if (selected.key !== activeTab.key) {
      haptics.selection();
    }
    setActiveTab(selected);
    onPress(selected.key);
  };

  return (
    <View style={styles.container}>
      <HorizontalCarousel>
        {tabs.map((tab) => (
          <OptionChip
            key={tab.key}
            label={tab.label}
            selected={activeTab.key === tab.key}
            onPress={() => onTabClick(tab)}
          />
        ))}
      </HorizontalCarousel>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
});
