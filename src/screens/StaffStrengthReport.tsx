// @ts-nocheck
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '../components';
import {useTheme} from '../hooks';
import {getStaffStrengthReport} from '../api/hrReportApi';

const StaffStrengthReport = () => {
  const {sizes} = useTheme();
  const [staffRows, setStaffRows] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadStaffRows = async () => {
      const rows = await getStaffStrengthReport();
      if (isMounted) {
        setStaffRows(rows);
      }
    };

    loadStaffRows();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = useMemo(
    () => staffRows.filter((row) => row.status === 'Active').length,
    [staffRows],
  );
  const inactiveCount = staffRows.length - activeCount;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Staff Strength Report
      </Text>

      <View style={styles.metricsRow}>
        <Text color="#64748b">Total Staff: {staffRows.length}</Text>
        <Text color="#64748b">Active: {activeCount}</Text>
        <Text color="#64748b">Inactive: {inactiveCount}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableHeader title="Employee ID" width={170} />
            <TableHeader title="Name" width={170} />
            <TableHeader title="Department" width={350} />
            <TableHeader title="Designation" width={240} />
            <TableHeader title="Status" width={120} />
          </View>
          {staffRows.map((row) => (
            <View key={row.employeeId} style={styles.tableRow}>
              <TableCell title={row.employeeId} width={170} />
              <TableCell title={row.name} width={170} />
              <TableCell title={row.department} width={350} />
              <TableCell title={row.designation} width={240} />
              <TableCell title={row.status} width={120} isStatus={true} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.cell, styles.headerCell, {width}]}> 
    <Text semibold color="#334155">{title}</Text>
  </View>
);

const TableCell = ({title, width, isStatus}: {title: string; width: number; isStatus?: boolean}) => {
  const statusColor = isStatus ? (title === 'Active' ? '#D81B8C' : '#e2e8f0') : '#f2f5f8';
  const statusTextColor = title === 'Inactive' ? '#64748b' : '#ffffff';
  return (
    <View style={[styles.cell, {width, backgroundColor: statusColor}]}> 
      <Text color={isStatus ? statusTextColor : '#334155'}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  title: {
    color: '#0f2946',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e6eaef',
  },
  cell: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#cfd5de',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#f2f5f8',
  },
  headerCell: {
    backgroundColor: '#e6eaef',
  },
});

export default StaffStrengthReport;
