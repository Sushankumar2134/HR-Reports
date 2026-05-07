import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

import {Button, Text} from '../../components';
import {useTheme} from '../../hooks';
import {DischargeSummaryRow, getDischargeSummaryList,saveDoctorNotes} from '../../api/EMRaccesAPI';

const PRIMARY_PINK = '#CB0C9F';
const PRIMARY_PINK_DARK = '#9B0A79';
const SCREEN_BG = '#f4f7fb';
const CARD_BG = '#ffffff';
const BORDER = '#d9dfe8';

const statusPalette = (status: string) => {
  const lowered = status.toLowerCase();

  if (lowered.includes('discharged')) {
    return {bg: '#e8f8ef', text: '#166534', border: '#b7ebc6'};
  }

  if (lowered.includes('progress')) {
    return {bg: '#fff7e6', text: '#92400e', border: '#fed7aa'};
  }

  return {bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe'};
};

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.cell, styles.headerCell, {width}]}> 
    <Text semibold color="#1f2a37" size={12}>
      {title}
    </Text>
  </View>
);

const DischargeSummaryList = () => {
  const {sizes, colors} = useTheme();
  const [rows, setRows] = useState<DischargeSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<DischargeSummaryRow | null>(null);
  const [notesRow, setNotesRow] = useState<DischargeSummaryRow | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRows = async () => {
      try {
        setLoading(true);
        const data = await getDischargeSummaryList();
        if (isMounted) {
          setRows(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRows();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [
        row.patientName,
        row.admissionId,
        row.status,
        row.notes,
        row.dischargeSummary,
        row.treatmentSummary,
        row.doctorName,
        row.diagnosis,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [rows, searchTerm]);

  const handleOpenNotes = (row: DischargeSummaryRow) => {
    setNotesRow(row);
    setNoteDraft(row.notes || '');
  };
const handleSaveNotes = async () => {

  if (!notesRow)
    return;

  try {

    await saveDoctorNotes(

      String(notesRow.id),

      noteDraft

    );

    // close modal
    setNotesRow(null);

    // refresh list
    const data =
      await getDischargeSummaryList();

    setRows(data);

  }

  catch (error) {

    console.log(
      'Save notes error:',
      error
    );

  }

};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{padding: sizes.padding}}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextBlock}>
          <Text h4 semibold style={styles.title}>
            Discharge Summary List
          </Text>
          <Text color="#5b6677" style={styles.subtitle}>
            EMR-Access module for quick review of discharge progress, summary details, and notes.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#64748b" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search patient, admission ID, or status"
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <TableHeader title="#" width={72} />
              <TableHeader title="Patient Name" width={220} />
              <TableHeader title="Admission ID" width={160} />
              <TableHeader title="Status" width={150} />
              <TableHeader title="Action" width={230} />
            </View>

            {loading ? (
              <View style={styles.loadingRow}>
                <Text color="#64748b">Loading discharge summaries...</Text>
              </View>
            ) : filteredRows.length ? (
              filteredRows.map((row, index) => {
                const palette = statusPalette(row.status);

                return (
                  <View key={String(row.id)} style={styles.tableRow}>
                    <View style={[styles.cell, {width: 72}]}> 
                      <Text size={12} color="#334155">
                        {index + 1}
                      </Text>
                    </View>

                    <View style={[styles.cell, {width: 220}]}> 
                      <Text size={12} color="#334155" semibold>
                        {row.patientName}
                      </Text>
                    </View>

                    <View style={[styles.cell, {width: 160}]}> 
                      <Text size={12} color="#334155">
                        {row.admissionId}
                      </Text>
                    </View>

                    <View style={[styles.cell, {width: 150}]}> 
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                          },
                        ]}>
                        <Text size={11} semibold color={palette.text}>
                          {row.status}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.cell, styles.actionCell, {width: 230}]}> 
                      <Button
                        primary
                        shadow={false}
                        onPress={() => setSelectedRow(row)}
                        style={styles.actionButton}>
                        <Text white semibold size={11}>
                          View
                        </Text>
                      </Button>

                      <Button
                        primary
                        shadow={false}
                        onPress={() => handleOpenNotes(row)}
                        style={styles.actionButton}>
                        <Text white semibold size={11}>
                          Notes
                        </Text>
                      </Button>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.loadingRow}>
                <Text color="#64748b">No discharge summaries found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(selectedRow)}
        onRequestClose={() => setSelectedRow(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text h5 semibold color="#10233d">
                Discharge Summary Details
              </Text>
              <Pressable onPress={() => setSelectedRow(null)}>
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            {selectedRow && (
              <View style={styles.modalBody}>
                <DetailRow label="Patient Name" value={selectedRow.patientName} />
                <DetailRow label="Admission ID" value={selectedRow.admissionId} />
                <DetailRow label="Status" value={selectedRow.status} />
                <DetailRow label="Discharge Summary" value={selectedRow.dischargeSummary} multiline />
                <DetailRow label="Treatment Summary" value={selectedRow.treatmentSummary || '-'} multiline />
                <DetailRow label="Doctor Name" value={selectedRow.doctorName || '-'} />
                <DetailRow label="Diagnosis" value={selectedRow.diagnosis || '-'} />
                <DetailRow label="Discharged On" value={selectedRow.dischargedOn || '-'} />
              </View>
            )}

            <View style={styles.modalFooter}>
              <Button primary shadow={false} onPress={() => setSelectedRow(null)} style={styles.footerButton}>
                <Text white semibold size={11}>
                  Close
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(notesRow)}
        onRequestClose={() => setNotesRow(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text h5 semibold color="#10233d">
                Notes
              </Text>
              <Pressable onPress={() => setNotesRow(null)}>
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text size={12} semibold color="#334155" style={styles.notesLabel}>
                Patient Notes
              </Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                multiline
                style={styles.notesInput}
                placeholder="Enter discharge notes"
                placeholderTextColor="#94a3b8"
                textAlignVertical="top"
              />
              <Text size={11} color="#64748b" style={styles.notesHint}>
                {notesRow?.notes || 'No notes available.'}
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Button
                primary
                shadow={false}
           onPress={handleSaveNotes}
                style={styles.footerButton}>
                <Text white semibold size={11}>
                  Save
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const DetailRow = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) => (
  <View style={[styles.detailRow, multiline && styles.detailRowMultiline]}>
    <Text size={12} semibold color="#475569" style={styles.detailLabel}>
      {label}
    </Text>
    <Text size={12} color="#1f2a37" style={styles.detailValue}>
      {value || '-'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  heroTextBlock: {
    marginBottom: 14,
  },
  title: {
    color: '#10233d',
    marginBottom: 6,
  },
  subtitle: {
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: '#10233d',
  },
  tableCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e7ebf0',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  headerCell: {
    minHeight: 50,
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    minWidth: 78,
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: PRIMARY_PINK_DARK,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  loadingRow: {
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 35, 61, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalBody: {
    gap: 12,
  },
  detailRow: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  detailRowMultiline: {
    minHeight: 96,
  },
  detailLabel: {
    marginBottom: 4,
  },
  detailValue: {
    lineHeight: 20,
  },
  modalFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerButton: {
    minWidth: 96,
    minHeight: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: PRIMARY_PINK,
  },
  notesLabel: {
    marginBottom: 6,
  },
  notesInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    color: '#10233d',
    backgroundColor: '#f8fafc',
  },
  notesHint: {
    marginTop: 4,
  },
});

export default DischargeSummaryList;