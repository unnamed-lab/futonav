import { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../theme/theme";

interface SearchBarProps {
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onQueryChange, placeholder = "Search buildings..." }: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleChange = useCallback(
    (text: string) => {
      setValue(text);
      onQueryChange(text);
    },
    [onQueryChange],
  );

  const handleClear = useCallback(() => {
    setValue("");
    onQueryChange("");
  }, [onQueryChange]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

