// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {Text} from '../../components';
import {useTheme} from '../../hooks';
import {getPatientRadiologyReports} from '../../api/patientPortalApi';

const RadiologyReports = () => {
  const {sizes} = useTheme();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      const response = await getPatientRadiologyReports();
      if (isMounted) {
        setRows(response);
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding, paddingBottom: sizes.xl}}>
      <View style={styles.titleCard}>
        <Text h4 semibold style={styles.title}>
          Radiology Reports
        </Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableMinWidth}>
            <View style={[styles.row, styles.headerRow]}>
              <TableCell title="#" width={50} header />
              <TableCell title="PATIENT" width={200} header />
              <TableCell title="SCAN TYPE" width={190} header />
              <TableCell title="STATUS" width={140} header />
              <TableCell title="FINDINGS" width={190} header />
              <TableCell title="DATE" width={140} header />
            </View>

            {rows.length ? (
              rows.map((item, index) => (
                <View key={item.id} style={styles.row}>
                  <TableCell title={String(index + 1)} width={50} />
                  <TableCell title={item.patientName} width={200} />
                  <TableCell title={item.scanType} width={190} />
                  <TableCell title={item.status} width={140} />
                  <TableCell title={item.findings} width={190} />
                  <TableCell title={item.date} width={140} />
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, styles.tableMinWidth]}>
                <Text color="#64748b">No radiology reports available</Text>
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
    paddingVertical: 14,
  },
  title: {
    color: '#0f2946',
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
    minWidth: 910,
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

export default RadiologyReports;
