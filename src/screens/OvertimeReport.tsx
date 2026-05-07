// @ts-nocheck
import React, {useState,useEffect} from 'react';
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
import { getDepartments } from "../api/hrReportApi";
import { getOvertimeReport } from "../api/hrReportApi";

type PickerField = 'fromDate' | 'toDate';


const OvertimeReport = () => {
  const {sizes} = useTheme();
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('All Departments');

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [pickerField, setPickerField] = useState<PickerField | null>(null);
 const [overtimeData, setOvertimeData] = useState<any[]>([]);
const [totalHours, setTotalHours] = useState(0);
const [totalAmount, setTotalAmount] = useState(0);

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
  const loadDepartments = async () => {
  try {
    const data = await getDepartments();

    console.log("Departments:", data);

    setDepartments([
      { id: null, department_name: "All Departments" },
      ...data
    ]);

  } catch (error) {
    console.log("Department error:", error);
  }
};

  useEffect(() => {
    loadDepartments();
  }, []);
const loadOvertime = async () => {
  try {
    const response = await getOvertimeReport(
      fromDate,
      toDate,
      employeeName,
      department
    );

    console.log("Overtime API:", response);

    setOvertimeData(
      response?.records || []
    );

    setTotalHours(
      response?.totalHours || 0
    );

    setTotalAmount(
      response?.totalAmount || 0
    );

  } catch (error) {
    console.log(
      "Error loading overtime:",
      error
    );
  }
};
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Overtime Report
      </Text>

      <View style={styles.filterRow}>
        <View style={styles.inputField}>
          <TextInput
            placeholder="Employee"
            placeholderTextColor="#94a3b8"
            value={employeeName}
            onChangeText={setEmployeeName}
            style={styles.textField}
          />
        </View>

        <Pressable
          style={styles.inputField}
          onPress={() => setShowDepartmentDropdown(true)}>
          <Text color="#334155">{department}</Text>
          <Ionicons name="chevron-down" size={14} color="#334155" />
        </Pressable>

        <DateField value={formatDate(fromDate)} onPress={() => setPickerField('fromDate')} />
        <DateField value={formatDate(toDate)} onPress={() => setPickerField('toDate')} />
      </View>

      <Button
        color="#D81B8C"
        shadow={false}
        style={styles.filterButton}
        onPress={loadOvertime}>
        <Text white semibold center>
          FILTER
        </Text>
      </Button>

      <View style={styles.metricsRow}>
        <Text color="#64748b">Total OT Hours: 0</Text>
        <Text color="#64748b">Total OT Amount: ₹0</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableHeader title="Emp ID" width={130} />
            <TableHeader title="Name" width={120} />
            <TableHeader title="Department" width={200} />
            <TableHeader title="Shift" width={100} />
            <TableHeader title="Date" width={100} />
            <TableHeader title="OT Hours" width={160} />
            <TableHeader title="Rate" width={100} />
            <TableHeader title="Amount" width={140} />
          </View>
        </View>
        {overtimeData.map((item, index) => (
  <View key={index} style={styles.tableRow}>
    
    <TableCell
      value={item.staff?.employee_id}
      width={130}
    />

    <TableCell
      value={item.staff?.name}
      width={120}
    />

    <TableCell
      value={item.department?.department_name}
      width={200}
    />

    <TableCell
      value={item.shift_id}
      width={100}
    />

    <TableCell
      value={item.attendance_date}
      width={100}
    />

    <TableCell
      value={item.overtime_hours?.toFixed(2)}
      width={160}
    />

    <TableCell
      value="100"
      width={100}
    />

    <TableCell
      value={item.amount?.toFixed(2)}
      width={140}
    />

  </View>
))}
      </ScrollView>
<DropdownModal
  visible={showDepartmentDropdown}
  options={departments.map(
    (d) => d.department_name
  )}
  selectedValue={department}
  onClose={() =>
    setShowDepartmentDropdown(false)
  }
  onSelect={(value) => {
    const selectedDept =
      departments.find(
        (d) =>
          d.department_name === value
      );

    setDepartment(
        selectedDept?.department_name ||
      "All Departments"
    );

    setShowDepartmentDropdown(false);
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
    <Text semibold color="#334155" size={12}>
      {title}
    </Text>
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
  title: {
    color: '#0f2946',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  inputField: {
    width: 280,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  textField: {
    fontSize: 14,
    color: '#334155',
    paddingVertical: 0,
  },
  dateField: {
    width: 260,
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
  filterButton: {
    minHeight: 40,
    minWidth: 200,
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#f2f5f8',
  },
  tableHeaderCell: {
    backgroundColor: '#e6eaef',
  },
});

export default OvertimeReport;
