import { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, CATEGORY_THEMES } from "../theme/theme";
import type { PoiCategoryType } from "@futonav/shared";

interface SearchBarProps {
  onQueryChange: (query: string) => void;
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  placeholder?: string;
}

const CATEGORIES: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Favorites", value: "Favorites" },
  { label: "Admin", value: "Admin" },
  { label: "Library", value: "Library" },
  { label: "Department", value: "Department" },
  { label: "Medical", value: "Medical" },
  { label: "Other", value: "Other" },
];

export function SearchBar({
  onQueryChange,
  selectedCategory = null,
  onCategoryChange,
  placeholder = "Search buildings...",
}: SearchBarProps) {
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
    <View style={styles.wrapper}>
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

      {onCategoryChange ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            const theme = cat.value && cat.value !== "Favorites" ? CATEGORY_THEMES[cat.value as PoiCategoryType] : null;

            return (
              <TouchableOpacity
                key={cat.label}
                onPress={() => onCategoryChange(isActive ? null : cat.value)}
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  isActive && theme && { backgroundColor: theme.color, borderColor: theme.color },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  container: {
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
  categoriesScroll: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chipTextActive: {
    fontFamily: FONTS.semibold,
    color: COLORS.white,
  },
});

