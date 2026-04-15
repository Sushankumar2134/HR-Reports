import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {Ionicons} from '@expo/vector-icons';
import {Button, Text} from '../components';
import {useTheme} from '../hooks';
import {getDepartments, DepartmentOption} from '../api/hrReportApi';

type PickerField = 'fromDate' | 'toDate';

const LEAVE_STATUS = ['All', 'Approved', 'Pending', 'Rejected'];

const LeaveReport = () => {
  const {sizes} = useTheme();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [pickerField, setPickerField] = useState<PickerField | null>(null);
  const [leaveDepartment, setLeaveDepartment] = useState('All Departments');
  const [showLeaveDepartmentDropdown, setShowLeaveDepartmentDropdown] =
    useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [leaveStatus, setLeaveStatus] = useState('All');
  const [showLeaveStatusDropdown, setShowLeaveStatusDropdown] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'mm/dd/yyyy';
    return date.toLocaleDateString('en-US');
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!pickerField) return;
    if (event.type === 'set' && selectedDate) {
      if (pickerField === 'fromDate') setFromDate(selectedDate);
      if (pickerField === 'toDate') setToDate(selectedDate);
    }
    if (Platform.OS === 'android' || event.type !== 'set') {
      setPickerField(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      const options = await getDepartments();
      if (isMounted) {
        setDepartmentOptions(options);
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <View style={styles.topBar}>
        <View style={styles.inlineCenter}>
          <Ionicons name="stats-chart-outline" size={15} color="#0f2946" />
          <Text h5 semibold color="#0f2946" style={{marginLeft: 8}}>
            Leave Report
          </Text>
        </View>

        <View style={styles.filterRow}>
          <DateField value={formatDate(fromDate)} onPress={() => setPickerField('fromDate')} />
          <DateField value={formatDate(toDate)} onPress={() => setPickerField('toDate')} />

          <Pressable
            style={styles.departmentField}
            onPress={() => setShowLeaveDepartmentDropdown(true)}>
            <Text color="#334155">{leaveDepartment}</Text>
            <Ionicons name="chevron-down" size={14} color="#334155" />
          </Pressable>

          <View style={styles.employeeField}>
            <TextInput placeholder="Employee" placeholderTextColor="#94a3b8" style={styles.textField} />
          </View>

          <Pressable
            style={styles.statusField}
            onPress={() => setShowLeaveStatusDropdown(true)}>
            <Text color="#334155">{leaveStatus}</Text>
            <Ionicons name="chevron-down" size={14} color="#334155" />
          </Pressable>

          <Button color="#D81B8C" shadow={false} style={styles.searchButton} onPress={() => null}>
            <Ionicons name="search" size={14} color="#ffffff" />
          </Button>
        </View>
      </View>

      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <TableHeader title="#" width={44} />
              <TableHeader title="Employee" width={140} />
              <TableHeader title="Department" width={160} />
              <TableHeader title="Leave Type" width={150} />
              <TableHeader title="From Date" width={130} />
              <TableHeader title="To Date" width={120} />
              <TableHeader title="Status" width={110} />
              <TableHeader title="Approved / Rejected By" width={260} />
              <TableHeader title="Days" width={80} />
            </View>
            <View style={styles.noDataRow}>
              <Text color="#334155">No records found</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.inlineCenter}>
          <Ionicons name="calendar-outline" size={16} color="#0f2946" />
          <Text h5 semibold color="#0f2946" style={{marginLeft: 8}}>
            Comp-Off Report
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <TableHeader title="Employee" width={220} />
              <TableHeader title="Date of Work on Holiday" width={480} />
              <TableHeader title="comp off applied date" width={430} />
            </View>
            <View style={styles.noDataRow}>
              <Text color="#334155">No Comp-Off Records</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <DropdownModal
        visible={showLeaveDepartmentDropdown}
        options={['All Departments', ...departmentOptions.map((item) => item.department_name)]}
        selectedValue={leaveDepartment}
        onClose={() => setShowLeaveDepartmentDropdown(false)}
        onSelect={(value) => {
          setLeaveDepartment(value);
          setShowLeaveDepartmentDropdown(false);
        }}
      />

      <DropdownModal
        visible={showLeaveStatusDropdown}
        options={LEAVE_STATUS}
        selectedValue={leaveStatus}
        onClose={() => setShowLeaveStatusDropdown(false)}
        onSelect={(value) => {
          setLeaveStatus(value);
          setShowLeaveStatusDropdown(false);
        }}
      />

      {pickerField && (
        <DateTimePicker
          mode="date"
          display="default"
          value={pickerField === 'fromDate' ? fromDate || new Date() : toDate || new Date()}
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
};

const DateField = ({value, onPress}: {value: string; onPress: () => void}) => (
  <Pressable style={styles.dateField} onPress={onPress}>
    <Text color="#334155">{value}</Text>
    <Ionicons name="calendar-outline" size={14} color="#334155" />
  </Pressable>
);

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.tableCell, styles.tableHeaderCell, {width}]}> 
    <Text semibold color="#334155">{title}</Text>
  </View>
);

const DropdownModal = ({
  visible,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  options: string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.dropdownMenu}>
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({item}) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={[
                styles.dropdownOption,
                item === selectedValue && styles.dropdownOptionSelected,
              ]}>
              <Text color={item === selectedValue ? '#ffffff' : '#334155'}>{item}</Text>
            </Pressable>
          )}
        />
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  topBar: {
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f2f5f8',
    marginBottom: 14,
  },
  inlineCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  dateField: {
    width: 170,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  departmentField: {
    width: 180,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeField: {
    width: 150,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  textField: {
    fontSize: 14,
    color: '#334155',
    paddingVertical: 0,
  },
  statusField: {
    width: 145,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchButton: {
    minHeight: 40,
    minWidth: 42,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f2f5f8',
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e6eaef',
  },
  tableCell: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#cfd5de',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#f2f5f8',
  },
  tableHeaderCell: {
    backgroundColor: '#e6eaef',
  },
  noDataRow: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#cfd5de',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f5f8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownMenu: {
    maxHeight: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cfd5de',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dropdownOption: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  dropdownOptionSelected: {
    backgroundColor: '#7a7a7a',
  },
});

export default LeaveReport;
