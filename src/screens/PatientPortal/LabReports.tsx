// @ts-nocheck
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';

import {Text} from '../../components';
import {useTheme} from '../../hooks';
import {getPatientLabReports} from '../../api/patientPortalApi';

const LabReports = () => {
  const {sizes} = useTheme();
  const [rows, setRows] = useState([]);
  const [sampleQuery, setSampleQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      const response = await getPatientLabReports();
      if (isMounted) {
        setRows(response);
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (!sampleQuery.trim()) {
      return rows;
    }
    const query = sampleQuery.trim().toLowerCase();
    return rows.filter((row) => String(row.sampleId).toLowerCase().includes(query));
  }, [rows, sampleQuery]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding, paddingBottom: sizes.xl}}>
      <View style={styles.titleCard}>
        <Text h4 semibold style={styles.title}>
          Lab Reports
        </Text>

      
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableMinWidth}>
            <View style={[styles.row, styles.headerRow]}>
              <TableCell title="#" width={50} header />
              <TableCell title="PATIENT" width={200} header />
              <TableCell title="SAMPLE ID" width={150} header />
              <TableCell title="STATUS" width={150} header />
              <TableCell title="RESULT" width={170} header />
              <TableCell title="DATE" width={140} header />
            </View>

            {filteredRows.length ? (
              filteredRows.map((item, index) => (
                <View key={item.id} style={styles.row}>
                  <TableCell title={String(index + 1)} width={50} />
                  <TableCell title={item.patientName} width={200} />
                  <TableCell title={item.sampleId} width={150} />
                  <TableCell title={item.status} width={150} />
                  <TableCell title={item.result} width={170} />
                  <TableCell title={item.date} width={140} />
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, styles.tableMinWidth]}>
                <Text color="#64748b">No lab reports available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const TableCell = ({title, width, header}: any) => {
  return (
    <View style={[styles.cell, {width}, header && styles.headerCell]}>
      <Text semibold={header} color={header ? '#334155' : '#475569'} size={12}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  titleCard: {
    borderWidth: 1,
    borderColor: '#cfd5de',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#0f2946',
  },
  searchInput: {
    width: 190,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    color: '#0f2946',
    fontSize: 12,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: '#cfd5de',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
  },
  tableMinWidth: {
    minWidth: 860,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#cfd5de',
  },
  cell: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerCell: {
    minHeight: 32,
  },
  emptyState: {
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LabReports;
