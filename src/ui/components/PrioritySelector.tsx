import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Priority } from '../../domain/types';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../theme';

interface Props {
  value: Priority | null;
  onChange: (level: Priority) => void;
}

export function PrioritySelector({ value, onChange }: Props) {
  const priorities: Priority[] = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.row}>
        {priorities.map((level) => {
          const selected = value === level;
          const config = COLORS.priority[level];
          return (
            <Pressable
              key={level}
              onPress={() => onChange(level)}
              accessibilityRole="button"
              accessibilityLabel={`Priority ${level} - ${config.label}`}
              accessibilityState={{ selected }}
              style={[
                styles.button,
                {
                  backgroundColor: config.bg,
                  opacity: selected ? 1.0 : 0.45,
                  borderColor: selected ? '#FFFFFF' : 'transparent',
                  borderWidth: selected ? 3 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: config.text,
                    fontWeight: selected ? 'bold' : 'normal',
                  },
                ]}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.captionRow}>
        <Text style={styles.captionText}>Critical (Red/Orange)</Text>
        <Text style={styles.captionText}>Routine (Green)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    height: LAYOUT.inputHeight, // >= 56px
    borderRadius: LAYOUT.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.title,
  },
  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  captionText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
});
