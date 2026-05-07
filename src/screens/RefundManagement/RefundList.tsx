import React, { useState ,useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {getRefundList, RefundRow,  deleteRefund,} from '../../api/RefundAPI';

const PRIMARY_PINK = '#C2188B';



const RefundManagement = ({ navigation }: any) => {
    const [refundData, setRefundData] = useState<RefundRow[]>([]);
const [loading, setLoading] = useState(true);
useFocusEffect(
  React.useCallback(() => {
    loadRefunds();
  }, []),
);
const loadRefunds = async () => {
  try {
    setLoading(true);

    const data = await getRefundList();

    setRefundData(data);
  } catch (error) {
    console.log(
      'Refund fetch error:',
      error,
    );

    Alert.alert(
      'Error',
      'Failed to load refunds',
    );
  } finally {
    setLoading(false);
  }
};

  const handleView = (item: any) => {
  Alert.alert(
    'Refund Details',
    `Refund No: ${item.refundNo}

Patient: ${item.patient}

Amount: ${item.amount}

Status: ${item.status}`,
  );
};

 const handleEdit = (item: any) => {
  navigation.navigate('EditRefund', {refund: item});
};const handleDelete = (item: any) => {

  Alert.alert(
    'Delete Refund',
    'Are you sure you want to delete this refund?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },

      {
        text: 'Delete',

        style: 'destructive',

        onPress: async () => {

          try {

            await deleteRefund(item.id);

            Alert.alert(
              'Success',
              'Refund deleted successfully',
            );

            loadRefunds();

          } catch (error: any) {

            console.log(
              'Delete refund error',
              error?.response?.data,
            );

            Alert.alert(
              'Error',
              'Failed to delete refund',
            );
          }
        },
      },
    ],
  );
};
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Refund Management</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateRefund')}>
          <Text style={styles.buttonText}>+ CREATE REFUND</Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.headerCell, styles.indexCell]}>#</Text>
              <Text style={[styles.headerCell, styles.refundCell]}>
                REFUND NO
              </Text>
              <Text style={[styles.headerCell, styles.patientCell]}>
                PATIENT
              </Text>
              <Text style={[styles.headerCell, styles.typeCell]}>
                REFUND TYPE
              </Text>
              <Text style={[styles.headerCell, styles.amountCell]}>
                AMOUNT
              </Text>
              <Text style={[styles.headerCell, styles.statusCell]}>
                STATUS
              </Text>
              <Text style={[styles.headerCell, styles.dateCell]}>
                DATE
              </Text>
              <Text style={[styles.headerCell, styles.actionCell]}>
                ACTIONS
              </Text>
            </View>

            {/* Table Rows */}
            {refundData.length > 0 ? (
              refundData.map((item, index) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.indexCell]}>
                    {index + 1}
                  </Text>

                  <Text style={[styles.cell, styles.refundCell]}>
                    {item.refundNo}
                  </Text>

                  <Text style={[styles.cell, styles.patientCell]}>
                    {item.patient}
                  </Text>

                  <Text style={[styles.cell, styles.typeCell]}>
                    {item.refundType}
                  </Text>

                  <Text style={[styles.cell, styles.amountCell]}>
                    {item.amount}
                  </Text>

                  <View style={[styles.statusCell, styles.statusWrapper]}>
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'Approved'
                          ? styles.approved
                          : styles.pending,
                      ]}>
                      {item.status}
                    </Text>
                  </View>

                  <Text style={[styles.cell, styles.dateCell]}>
                    {item.date}
                  </Text>

                  <View style={[styles.actionCell, styles.actionRow]}>
                    <TouchableOpacity onPress={() => handleView(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="eye" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="pencil" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="trash-can" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No Refunds Found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default RefundManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 15,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  createButton: {
    backgroundColor: PRIMARY_PINK,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
    elevation: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },

  tableHeader: {
    backgroundColor: '#F3F4F6',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    alignItems: 'center',
    minHeight: 55,
  },

  headerCell: {
    fontWeight: '700',
    fontSize: 12,
    color: '#333',
    padding: 12,
  },

  cell: {
    fontSize: 13,
    color: '#444',
    padding: 12,
  },

  indexCell: {
    width: 60,
  },

  refundCell: {
    width: 130,
  },

  patientCell: {
    width: 140,
  },

  typeCell: {
    width: 140,
  },

  amountCell: {
    width: 110,
  },

  statusCell: {
    width: 120,
  },

  dateCell: {
    width: 120,
  },

  actionCell: {
    width: 120,
  },

  statusWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 12,
  },

  statusText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },

  approved: {
    backgroundColor: '#28A745',
  },

  pending: {
    backgroundColor: '#FFA500',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  iconButton: {
    padding: 6,
  },

  noDataContainer: {
    padding: 30,
    alignItems: 'center',
  },

  noDataText: {
    color: '#777',
    fontSize: 14,
  },
});