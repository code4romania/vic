import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { Icon, IconElement, StyleService, useTheme } from '@ui-kitten/components';
import Input from './Input';
import SortSvg from '../assets/svg/sort';
import FiltersSvg from '../assets/svg/filters';
import { SvgXml } from 'react-native-svg';

interface SearchWithOrderAndFiltersProps {
  placeholder: string;
  onChange: (value: string) => void;
  debounceTime?: number;
  onSort?: () => void;
  onFilter?: () => void;
}

const SearchIcon = (): IconElement => {
  const theme = useTheme();
  return <Icon style={[styles.searchIcon, { tintColor: theme['cool-gray-400'] }]} name="search" />;
};

const ClearIcon = (): IconElement => {
  const theme = useTheme();
  return <Icon style={[styles.clearIcon, { tintColor: theme['cool-gray-400'] }]} name="x" />;
};

const SearchWithOrderAndFilters = ({
  placeholder,
  onChange,
  debounceTime,
  onSort,
  onFilter,
}: SearchWithOrderAndFiltersProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  // custom debounce
  useEffect(() => {
    if (searchValue === undefined) {
      // skip initial useEffect
      return;
    }

    const timeoutId = setTimeout(() => {
      searchValue && onChange(searchValue);
    }, debounceTime || 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onChange, debounceTime]);

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const renderClearAllIcon = ({ onPress }: { onPress: () => void }) => {
    return searchValue.length > 0 ? (
      <Pressable onPress={onPress}>
        <ClearIcon />
      </Pressable>
    ) : (
      <></>
    );
  };

  const onClearInput = () => {
    setSearchValue('');
    onChange('');
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputContainer}>
        <Input
          value={searchValue}
          placeholder={placeholder}
          accessoryLeft={SearchIcon}
          accessoryRight={(props: any) => renderClearAllIcon({ ...props, onPress: onClearInput })}
          onChangeText={setSearchValue}
          onSubmitEditing={handleKeyboardDismiss}
        />
      </View>
      <Pressable style={styles.filtersContainer} onPress={onSort}>
        <SvgXml xml={SortSvg} style={styles.svg} />
      </Pressable>
      <Pressable style={styles.filtersContainer} onPress={onFilter}>
        <SvgXml xml={FiltersSvg} style={styles.svg} />
      </Pressable>
    </View>
  );
};

const styles = StyleService.create({
  searchContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 4,
  },
  filtersContainer: {
    flex: 1,
  },
  searchIcon: {
    height: 20,
    width: 20,
    marginHorizontal: 4,
  },
  clearIcon: {
    height: 16,
    width: 16,
  },
  svg: {
    marginTop: '20%',
    marginLeft: '40%',
  },
});

export default SearchWithOrderAndFilters;
