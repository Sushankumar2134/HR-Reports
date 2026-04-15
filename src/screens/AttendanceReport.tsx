// @ts-nocheck
import React, {useState,useEffect} from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {Ionicons} from '@expo/vector-icons';
import {Button, Text} from '../components';
import {useTheme} from '../hooks';
import { getAttendanceReport,  getDepartments } from '../api/hrReportApi';

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

type PickerField = 'fromDate' | 'toDate';

const STATUS_OPTIONS = ['All Status', 'Present', 'Absent', 'Late'];
const Departments  = [
  'All Departments',
  'Emergency',
  'Nursing',
  'Pharmacy',
  'Administration',
];
const EXPORT_OPTIONS = [
  {
    key: "pdf",
    label: "Export PDF",
    icon: "document-attach-outline",
    color: "#ef4444",
  },
];

const AttendanceReport = () => {
  const {sizes} = useTheme();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [pickerField, setPickerField] = useState<PickerField | null>(null);
 const [attendanceDepartment, setAttendanceDepartment] =
  useState<number | null>(null);
    
    const [attendanceData, setAttendanceData] = useState([]); const [loading, setLoading] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('All Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
 const [departments, setDepartments] = useState([]);
 

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
const fetchAttendance = async () => {
  try {
    setLoading(true);

    const response =
      await getAttendanceReport(
        fromDate
          ? fromDate.toISOString()
          : undefined,

        toDate
          ? toDate.toISOString()
          : undefined,

        attendanceDepartment || undefined,

        attendanceStatus !== "All Status"
          ? attendanceStatus
          : undefined
      );

    console.log(
      "Attendance Data:",
      response
    );

    // SAFE HANDLING
    if (Array.isArray(response)) {
      setAttendanceData(response);
    } else {
      setAttendanceData(
        response?.attendance || []
      );
    }

  } catch (error) {
    console.log(
      "Error fetching attendance:",
      error
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAttendance();
}, []);

const loadDepartments = async () => {
  try {
    const deptData =
      await getDepartments();

    console.log(
      "Departments:",
      deptData
    );

    if (deptData) {
      setDepartments([
        {
          id: null,
          department_name:
            "All Departments",
        },
        ...deptData,
      ]);
    }

  } catch (error) {
    console.log(
      "Department error:",
      error
    );
  }
};
useEffect(() => {
  loadDepartments();
}, []);

const calculateWorkingHours = (
  checkIn: string,
  checkOut: string
) => {
  try {
    const start = new Date(
      `1970-01-01T${checkIn}`
    );

    const end = new Date(
      `1970-01-01T${checkOut}`
    );

    const diff =
      (end.getTime() -
        start.getTime()) /
      1000 /
      60 /
      60;

    return diff.toFixed(2);

  } catch {
    return "-";
  }
};const handleExport = async (type: string) => {
  try {
    setShowExportDropdown(false);

    if (!attendanceData.length) {
      alert("No data to export");
      return;
    }

    if (type === "pdf") {
      exportPDF();
    }

  } catch (error) {
    console.log("Export error:", error);
  }
};

const exportPDF = async () => {
  try {
    if (!attendanceData.length) {
      alert("No data to export");
      return;
    }

    const escapePdfText = (text: string) =>
      String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

    const contentLines = [
      'Attendance Report',
      '----------------------------------------',
      ...attendanceData.map(
        (item: any, index: number) =>
          `${index + 1}. ${item.staff?.name || '-'} | ${item.department?.department_name || '-'} | ${item.attendance_date || '-'} | ${item.status || '-'}`,
      ),
    ];

    const maxLines = 44;
    const trimmedLines = contentLines.slice(0, maxLines);

    let stream = 'BT\n/F1 11 Tf\n14 TL\n40 780 Td\n';
    trimmedLines.forEach((line, index) => {
      stream += `(${escapePdfText(line)}) Tj\n`;
      if (index < trimmedLines.length - 1) stream += 'T*\n';
    });
    stream += 'ET';

    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
      `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((obj) => {
      offsets.push(pdf.length);
      pdf += obj;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    const fileUri = FileSystem.documentDirectory + 'AttendanceReport.pdf';
    await FileSystem.writeAsStringAsync(fileUri, pdf, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri);

  } catch (error) {
    console.log("PDF export error:", error);
  }
};
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Attendance Report
      </Text>

      <View style={styles.filterRow}>
        <DateField value={formatDate(fromDate)} onPress={() => setPickerField('fromDate')} />
        <DateField value={formatDate(toDate)} onPress={() => setPickerField('toDate')} />

        <Pressable
          style={styles.dropdownStatic}
          onPress={() => setShowDepartmentDropdown(true)}>
          <Text color="#334155">
  {
    departments.find(
      d => d.id === attendanceDepartment
    )?.department_name || "All Departments"
  }
</Text>
          <Ionicons name="chevron-down" size={14} color="#334155" />
        </Pressable>

        <Pressable
          style={styles.dropdownInput}
          onPress={() => setShowStatusDropdown(true)}>
          <Text color="#334155">{attendanceStatus}</Text>
          <Ionicons name="chevron-down" size={14} color="#334155" />
        </Pressable>

        <Button color="#D81B8C" shadow={false} style={styles.goButton} onPress={() => fetchAttendance()}>
          <Text white semibold center>
            GO
          </Text>
        </Button>
      </View>

      <View style={styles.metricsRow}>
        <Text color="#64748b">Total Days: 0</Text>
        <Text color="#64748b">Present: 0</Text>
        <Text color="#64748b">Absent: 0</Text>
        <Text color="#64748b">Attendance %: 0%</Text>
      </View>

      <View style={styles.exportRow}>
        <Pressable
          style={[styles.exportButton, {backgroundColor: '#D81B8C'}]}
          onPress={() => setShowExportDropdown((prev) => !prev)}>
          <View style={styles.inlineCenter}>
            <Ionicons name="download-outline" size={14} color="#ffffff" />
            <Text semibold size={12} color="#ffffff" style={{marginLeft: 4}}>
              EXPORT
            </Text>
            <Ionicons
              name={showExportDropdown ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#ffffff"
            />
          </View>
        </Pressable>

        {showExportDropdown && (
          <View style={styles.exportDropdown}>
        {EXPORT_OPTIONS.map((option) => (
  <Pressable
    key={option.key}
    style={styles.exportItem}
    onPress={() => handleExport(option.key)}
  >
    <Ionicons
      name={option.icon as any}
      size={16}
      color={option.color}
    />
    <Text
      semibold
      color={option.color}
      style={{marginLeft: 8}}
    >
      {option.label}
    </Text>
  </Pressable>
))}
          </View>
        )}
      </View>
{loading && (
  <Text>
    Loading attendance...
  </Text>
)}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>

  {/* Header */}
  <View style={[styles.tableRow, styles.tableHeader]}>
    <TableHeader title="Employee" width={140} />
    <TableHeader title="Department" width={170} />
    <TableHeader title="Date" width={80} />
    <TableHeader title="Check In" width={120} />
    <TableHeader title="Check Out" width={120} />
    <TableHeader title="Working Hours" width={180} />
    <TableHeader title="Status" width={100} />
    <TableHeader title="Late (min)" width={140} />
    <TableHeader title="Overtime (min)" width={170} />
  </View>

  {/* Data */}
  {attendanceData.map((item: any, index: number) => (
   <View
  key={item.id || index}
  style={styles.tableRow}
>

      <TableCell
  value={item.staff?.name}
  width={140}
/>

<TableCell
  value={item.department?.department_name}
  width={170}
/>

<TableCell
  value={item.attendance_date}
  width={80}
/>

<TableCell
  value={item.check_in}
  width={120}
/>

<TableCell
  value={item.check_out}
  width={120}
/>

{/* ADD THIS */}
<TableCell
  value={
    item.check_in && item.check_out
      ? calculateWorkingHours(
          item.check_in,
          item.check_out
        )
      : "-"
  }
  width={180}
/>
<TableCell
  value={item.status}
  width={100}
/>

<TableCell
  value={String(item.late_minutes)}
  width={140}
/>

<TableCell
  value={String(item.overtime_minutes)}
  width={170}
/>

    </View>
  ))}

</View>
      </ScrollView>

      <DropdownModal
        visible={showDepartmentDropdown}
       options={departments.map(d => d.department_name)}
        selectedValue={attendanceDepartment}
        onClose={() => setShowDepartmentDropdown(false)}
      onSelect={(value) => {
  const selectedDept = departments.find(
  (d) => d.department_name === value
);
  setAttendanceDepartment(
    selectedDept?.id || null
  );
}}
      />

      <DropdownModal
        visible={showStatusDropdown}
        options={STATUS_OPTIONS}
        selectedValue={attendanceStatus}
        onClose={() => setShowStatusDropdown(false)}
        onSelect={(value) => {
          setAttendanceStatus(value);
          setShowStatusDropdown(false);
        }}
      />

      {showExportDropdown && (
        <Pressable style={styles.exportBackdrop} onPress={() => setShowExportDropdown(false)} />
      )}

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
  <Pressable style={styles.dateInput} onPress={onPress}>
    <Text color="#334155">{value}</Text>
    <Ionicons name="calendar-outline" size={14} color="#334155" />
  </Pressable>
);

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.tableCell, styles.tableHeaderCell, {width}]}> 
    <Text semibold color="#334155">{title}</Text>
  </View>
);
const TableCell = ({
  value,
  width,
}: {
  value: string;
  width: number;
}) => (
  <View style={[styles.tableCell, {width}]}>
    <Text color="#334155">
      {value || "-"}
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
   keyExtractor={(item, index) =>
  index.toString()
}
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
  dateInput: {
    width: 245,
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
  dropdownStatic: {
    width: 245,
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
  dropdownInput: {
    width: 160,
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
  goButton: {
    minHeight: 40,
    minWidth: 54,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    marginBottom: 12,
  },
  exportRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
    position: 'relative',
    zIndex: 2,
  },
  exportButton: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  inlineCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportDropdown: {
    width: 140,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cfd5de',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  exportItem: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  exportBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

export default AttendanceReport;
