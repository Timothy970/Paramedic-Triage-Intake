import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { submitTriage } from '../../store/triageSlice';
import { RootState, AppDispatch } from '../../store/store';
import { Priority, Status, TriageRecord } from '../../domain/types';
import { PrioritySelector } from './PrioritySelector';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../theme';

export function TriageForm() {
  const dispatch = useDispatch<AppDispatch>();
  const allRecords = useSelector((state: RootState) => state.triage.allRecords);
  const isOnline = useSelector((state: RootState) => state.triage.isOnline);
  const simulatedFailure = useSelector((state: RootState) => state.triage.simulatedFailure);

  const appIsOnline = isOnline && !simulatedFailure;

  // Form State
  const [patientName, setPatientName] = useState('');
  const [condition, setCondition] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [status, setStatus] = useState<Status>('Pending');

  // Filter State
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Synced'>('All');

  // Validation State
  const [touched, setTouched] = useState({
    patientName: false,
    condition: false,
  });

  // Filtered records for the local triage log
  const filteredRecords = allRecords.filter((record) => {
    if (filter === 'Pending') return !record.synced;
    if (filter === 'Synced') return record.synced;
    return true;
  });

  // Calculate Errors
  const errors = {
    patientName: touched.patientName && !patientName.trim() ? 'Patient name is required' : '',
    condition: touched.condition && !condition.trim() ? 'Condition description is required' : '',
  };

  const isFormValid =
    patientName.trim().length > 0 &&
    condition.trim().length > 0 &&
    priority !== null;

  const handleBlur = (field: 'patientName' | 'condition') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    try {
      await dispatch(
        submitTriage({
          patientName: patientName.trim(),
          condition: condition.trim(),
          priority: priority as Priority,
          status,
        })
      );

      // Reset form on success
      setPatientName('');
      setCondition('');
      setPriority(null);
      setStatus('Pending');
      setTouched({ patientName: false, condition: false });
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const getPriorityStyle = (p: Priority) => {
    return COLORS.priority[p];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Paramedic Triage Intake</Text>

          {/* Patient Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Patient Name</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.patientName ? styles.inputErrorBorder : null,
              ]}
              value={patientName}
              onChangeText={setPatientName}
              onBlur={() => handleBlur('patientName')}
              placeholder="e.g. John Doe"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Patient Name Input"
            />
            {errors.patientName ? (
              <Text style={styles.errorText}>{errors.patientName}</Text>
            ) : null}
          </View>

          {/* Condition Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Condition Description</Text>
            <TextInput
              style={[
                styles.textArea,
                errors.condition ? styles.inputErrorBorder : null,
              ]}
              value={condition}
              onChangeText={setCondition}
              onBlur={() => handleBlur('condition')}
              placeholder="Chief complaint, mechanism of injury, vitals..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Condition Description Input"
            />
            {errors.condition ? (
              <Text style={styles.errorText}>{errors.condition}</Text>
            ) : null}
          </View>

          {/* Priority Selector Component */}
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* Status Toggle (Pending vs In-Transit) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.toggleRow}>
              {(['Pending', 'In-Transit'] as Status[]).map((s) => {
                const isSelected = status === s;
                return (
                  <Pressable
                    key={s}
                    style={[
                      styles.toggleButton,
                      isSelected ? styles.toggleActiveButton : null,
                    ]}
                    onPress={() => setStatus(s)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Status ${s}`}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        isSelected ? styles.toggleActiveButtonText : null,
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              !isFormValid ? styles.submitButtonDisabled : null,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            accessibilityRole="button"
            accessibilityLabel="Submit Triage Record"
          >
            <Text style={styles.submitButtonText}>SUBMIT TRIAGE RECORD</Text>
          </Pressable>

          {!appIsOnline && (
            <Text style={styles.reassuranceText}>
              Saved locally immediately • Auto-syncs when online
            </Text>
          )}
        </View>

        {/* Triage Log / History List */}
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Local Triage Log</Text>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {(['All', 'Pending', 'Synced'] as const).map((tab) => {
              const isActive = filter === tab;
              const count = tab === 'All'
                ? allRecords.length
                : tab === 'Pending'
                ? allRecords.filter(r => !r.synced).length
                : allRecords.filter(r => r.synced).length;
              
              const label = tab === 'Pending' ? 'Pending Sync' : tab;

              return (
                <Pressable
                  key={tab}
                  style={[styles.filterTab, isActive ? styles.filterTabActive : null]}
                  onPress={() => setFilter(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.filterTabText, isActive ? styles.filterTabActiveText : null]}>
                    {label} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredRecords.length === 0 ? (
            <Text style={styles.emptyText}>No records logged matching this filter.</Text>
          ) : (
            [...filteredRecords]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((record) => {
                const priorityConfig = getPriorityStyle(record.priority);
                return (
                  <View key={record.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <View style={styles.logPatientRow}>
                        <View
                          style={[
                            styles.priorityPill,
                            { backgroundColor: priorityConfig.bg },
                          ]}
                        >
                          <Text style={[styles.priorityPillText, { color: priorityConfig.text }]}>
                            P{record.priority}
                          </Text>
                        </View>
                        <Text style={styles.logPatientName}>{record.patientName}</Text>
                      </View>
                      <View
                        style={[
                          styles.syncBadge,
                          {
                            backgroundColor: record.synced
                              ? 'rgba(46, 125, 50, 0.15)'
                              : 'rgba(230, 81, 0, 0.15)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.syncBadgeText,
                            { color: record.synced ? COLORS.success : '#D85A30' },
                          ]}
                        >
                          {record.synced ? 'Synced ✓' : 'Pending ↻'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logCondition}>{record.condition}</Text>
                    <View style={styles.logFooter}>
                      <Text style={styles.logMeta}>Status: {record.status}</Text>
                      <Text style={styles.logMeta}>
                        {new Date(record.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SPACING.md,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  textInput: {
    height: LAYOUT.inputHeight,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.input,
  },
  textArea: {
    height: 100,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.input,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    height: LAYOUT.inputHeight - 4,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActiveButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
  },
  toggleActiveButtonText: {
    color: '#FFFFFF',
  },
  submitButton: {
    height: LAYOUT.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.primaryDisabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.subtitle,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  reassuranceText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  logContainer: {
    marginTop: SPACING.xl,
  },
  logTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.title - 2,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  logCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  logPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityPillText: {
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.sizes.caption + 1,
  },
  logPatientName: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: 'bold',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncBadgeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: '600',
  },
  logCondition: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.body - 1,
    marginVertical: SPACING.xs,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },
  logMeta: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: LAYOUT.borderRadius - 4,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.body - 2,
    fontWeight: '600',
  },
  filterTabActiveText: {
    color: '#FFFFFF',
  },
});
