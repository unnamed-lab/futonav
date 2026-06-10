import { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#94A3B8" />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
