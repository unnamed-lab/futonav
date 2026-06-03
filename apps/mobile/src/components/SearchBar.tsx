import { useState, useCallback } from "react";
import { View, TextInput, StyleSheet } from "react-native";

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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCorrect={false}
        autoCapitalize="none"
      />
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
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
