import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '../components';
import {useTheme} from '../hooks';
import {DepartmentSalaryRow, getDepartmentSalaryReport} from '../api/hrReportApi';

const DepartmentSalaryReport = () => {
  const {sizes} = useTheme();
  const [rows, setRows] = useState<DepartmentSalaryRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const payload = await getDepartmentSalaryReport();
      if (isMounted) {
        setRows(payload || []);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Department Salary Report
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableHeader title="Department" width={200} />
            <TableHeader title="Total Employees" width={180} />
            <TableHeader title="Total Salary" width={160} />
            <TableHeader title="Average Salary" width={180} />
            <TableHeader title="Highest Salary" width={180} />
            <TableHeader title="Lowest Salary" width={160} />
          </View>

          {rows.map((row, index) => (
            <View key={`${row.department}-${index}`} style={styles.tableRow}>
              <TableCell value={row.department} width={200} />
              <TableCell value={String(row.totalEmployees)} width={180} />
              <TableCell value={`₹${row.totalSalary}`} width={160} />
              <TableCell value={`₹${row.averageSalary}`} width={180} />
              <TableCell value={`₹${row.highestSalary}`} width={180} />
              <TableCell value={`₹${row.lowestSalary}`} width={160} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.tableCell, styles.tableHeaderCell, {width}]}>
    <Text semibold color="#334155" size={12}>
      {title}
    </Text>
  </View>
);

const TableCell = ({value, width}: {value: string; width: number}) => (
  <View style={[styles.tableCell, {width}]}>
    <Text color="#334155" size={13}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  title: {
    color: '#0f2946',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e6eaef',
  },
  tableCell: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#cfd5de',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  tableHeaderCell: {
    backgroundColor: '#e6eaef',
  },
});

export default DepartmentSalaryReport;
