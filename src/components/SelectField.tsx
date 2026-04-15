import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import useTheme from '../hooks/useTheme';
import Text from './Text';

export interface SelectOption {
  id: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (option: SelectOption) => void;
  disabled?: boolean;
}

const SelectField = ({
  label,
  value,
  placeholder = 'Select',
  options,
  onChange,
  disabled,
}: SelectFieldProps) => {
  const {colors, sizes} = useTheme();
  const [open, setOpen] = useState(false);

  const selectedValue = useMemo(() => value || placeholder, [value, placeholder]);

  return (
    <View style={{marginBottom: sizes.sm}}>
      <Text p semibold marginBottom={sizes.xs}>
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={StyleSheet.flatten([
          styles.selector,
          {
            borderColor: colors.gray,
            backgroundColor: disabled ? colors.light : colors.white,
          },
        ])}>
        <Text color={value ? colors.text : colors.gray}>{selectedValue}</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={StyleSheet.flatten([
              styles.dropdown,
              {backgroundColor: colors.white, borderColor: colors.light},
            ])}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.id)}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}>
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: colors.light}} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 360,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
});

export default SelectField;
