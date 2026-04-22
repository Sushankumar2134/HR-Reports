// @ts-nocheck
import React, {useMemo, useState,useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Text} from '../../components';
import {useTheme} from '../../hooks';
import { getEmergencyRecords }
from "../../api/EmergencyRecordsAPI";

type EmergencyStatus = 'Critical' | 'Stable' | 'Observation';

interface EmergencyRecord {
  uhid: string;
  patient: string;
  blood: string;
  contact: string;
  type: string;
  status: EmergencyStatus;
}

const getStatusStyle = (status: EmergencyStatus) => {
  if (status === 'Critical') {
    return {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      borderColor: '#fecaca',
    };
  }

  if (status === 'Stable') {
    return {
      backgroundColor: '#dcfce7',
      color: '#166534',
      borderColor: '#bbf7d0',
    };
  }

  return {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#fde68a',
  };
};

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.cell, styles.headerCell, {width}]}> 
    <Text semibold color="#334155" size={12}>
      {title}
    </Text>
  </View>
);

const EmergencyRecords = () => {
  const {sizes} = useTheme();
  

  const [activeRecord, setActiveRecord] = useState<EmergencyRecord | null>(null);

const [searchTerm, setSearchTerm] = useState('');
const [records, setRecords] = useState([]);
const [loading, setLoading] = useState(false);

const filteredRecords = useMemo(() => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return records;
  }

  return records.filter((record) =>
    [
      record.uhid,
      record.patient,
      record.blood,
      record.contact,
      record.type,
      record.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
}, [searchTerm, records]);
const fetchEmergencyRecords = async () => {
  try {
    setLoading(true);

    const data = await getEmergencyRecords();

    setRecords(data);

  } catch (error) {
    console.log("Error fetching emergency:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEmergencyRecords();
}, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <View style={styles.headerRow}>
        <View>
          <Text h4 semibold style={styles.title}>
            Emergency Records
          </Text>
          <Text color="#64748b" size={12}>
            Quick access to critical patient information
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient..."
            placeholderTextColor="#94a3b8"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.tableWrapper}>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableHeader title="UHID" width={140} />
            <TableHeader title="PATIENT" width={220} />
            <TableHeader title="BLOOD" width={110} />
            <TableHeader title="CONTACT" width={190} />
            <TableHeader title="TYPE" width={220} />
            <TableHeader title="STATUS" width={150} />
            <TableHeader title="ACTION" width={130} />
          </View>

          {filteredRecords.length ? (
            filteredRecords.map((record) => {
              const statusStyle = getStatusStyle(record.status);

              return (
                <View key={record.uhid} style={styles.tableRow}>
                  <View style={[styles.cell, {width: 140}]}> 
                    <Text color="#334155" size={12}>
                      {record.uhid}
                    </Text>
                  </View>

                  <View style={[styles.cell, {width: 220}]}> 
                    <Text color="#334155" size={12}>
                      {record.patient}
                    </Text>
                  </View>

                  <View style={[styles.cell, {width: 110}]}> 
                    <Text color="#334155" size={12}>
                      {record.blood}
                    </Text>
                  </View>

                  <View style={[styles.cell, {width: 190}]}> 
                    <Text color="#334155" size={12}>
                      {record.contact}
                    </Text>
                  </View>

                  <View style={[styles.cell, {width: 220}]}> 
                    <Text color="#334155" size={12}>
                      {record.type}
                    </Text>
                  </View>

                  <View style={[styles.cell, {width: 150}]}> 
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: statusStyle.backgroundColor,
                          borderColor: statusStyle.borderColor,
                        },
                      ]}>
                      <Text color={statusStyle.color} size={11} semibold>
                        {record.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.cell, {width: 130}]}> 
                    <Pressable
                      onPress={() => setActiveRecord(record)}
                      style={styles.viewButton}>
                      <Ionicons name="eye-outline" size={13} color="#ffffff" />
                      <Text color="#ffffff" size={12} semibold>
                        View
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.cell, styles.emptyRow]}> 
              <Text color="#64748b">No records found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(activeRecord)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveRecord(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text semibold h5 color="#0f2946">
                Emergency Record
              </Text>
              <Pressable onPress={() => setActiveRecord(null)}>
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            {activeRecord && (
              <View style={styles.modalBody}>
                <LabelValue label="UHID" value={activeRecord.uhid} />
                <LabelValue label="Patient" value={activeRecord.patient} />
                <LabelValue label="Blood Group" value={activeRecord.blood} />
                <LabelValue label="Contact" value={activeRecord.contact} />
                <LabelValue label="Emergency Type" value={activeRecord.type} />
                <LabelValue label="Status" value={activeRecord.status} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const LabelValue = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Text semibold color="#334155" size={12}>
      {label}
    </Text>
    <Text color="#0f2946">{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    color: '#ef4444',
    marginBottom: 3,
  },
  searchBox: {
    width: 290,
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#d6dbe4',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#334155',
    fontSize: 13,
    paddingVertical: 6,
  },
  tableWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6dbe4',
    backgroundColor: '#f8fafc',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
  },
  cell: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
  },
  headerCell: {
    minHeight: 40,
    backgroundColor: '#f1f5f9',
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#be0f78',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D81B8C',
  },
  emptyRow: {
    width: 1160,
    borderRightWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe2eb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBody: {
    gap: 10,
  },
  detailRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
});

export default EmergencyRecords;