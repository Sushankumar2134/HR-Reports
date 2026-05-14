import React, {
  useEffect,
  useState,
} from 'react';

import instance from '../../api/axios';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text} from '../../components';
import {
  updateSubscriptionInvoice,
    deleteSubscriptionInvoice,
} from '../../api/SubscriptionAPI';
const PRIMARY_DARK_PINK = '#C2188B';

const STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Cancelled'];



const SubscriptionInvoices = () => {
  const {width} = useWindowDimensions();
  const isMobile = width < 768;
const [invoices, setInvoices] = useState<any[]>([]);
const [subscriptions, setSubscriptions] =
  useState<any[]>([]);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({

  subscription_id: '',

  invoiceNo: '',

  amount: '',

  invoiceDate: '',

  dueDate: '',

  status: 'Pending',
});
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
const [selectedSubscription, setSelectedSubscription] =
  useState<any>(null);
useEffect(() => {

  loadInvoices();
  loadSubscriptions();

}, []);

const loadInvoices = async () => {

  try {

    const response = await instance.get(
      '/subscription-invoices'
    );

    console.log(
      'INVOICE API:',
      response.data,
    );

    const rows = response.data.map(
      (item: any) => ({
        id: item.id,
invoiceNo:
  item.invoice_number ??
  'N/A',

        organization:
          item.subscription
            ?.organization?.name ??
          'N/A',

        plan:
          item.subscription
            ?.plan?.name ??
          'N/A',

        amount:
          `₹ ${item.total_amount ?? 0}`,

        invoiceDate:
          item.invoice_date,

        dueDate:
          item.due_date,

        status:
          item.status ??
          'Pending',
      }),
    );

    setInvoices(rows);

  } catch (error) {

    console.log(
      'INVOICE FETCH ERROR:',
      error,
    );
  }
};
  const handleEdit = (inv: any) => {

  setEditing(inv);

  setForm({

    subscription_id:
      inv.subscription_id ?? '',

    invoiceNo:
      inv.invoiceNo,

    amount:
      String(inv.amount)
        .replace('₹', '')
        .trim(),

    invoiceDate:
      inv.invoiceDate,

    dueDate:
      inv.dueDate,

    status:
      inv.status,
  });

  setMode('edit');
};

 const handleDelete = (inv: any) => {

  Alert.alert(
    'Delete',
    'Delete this invoice?',
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

            await deleteSubscriptionInvoice(
              inv.id,
            );

            Alert.alert(
              'Success',
              'Invoice deleted successfully',
            );

            await loadInvoices();

          } catch (error) {

            console.log(
              'DELETE ERROR:',
              error,
            );

            Alert.alert(
              'Error',
              'Failed to delete invoice',
            );
          }
        },
      },
    ],
  );
};
const loadSubscriptions = async () => {

  try {

    const response = await instance.get(
      '/subscriptions'
    );

    console.log(
      'SUBSCRIPTIONS API:',
      response.data,
    );

    setSubscriptions(response.data);

  } catch (error) {

    console.log(
      'SUBSCRIPTION FETCH ERROR:',
      error,
    );
  }
};
  const handleCreate = () => {
    setShowSubscriptionDropdown(false);
    setShowStatusDropdown(false);
   setSelectedSubscription(null);
    setMode('create');
  };

const handleCreateSubmit = async () => {

  try {

    if (!selectedSubscription) {

      Alert.alert(
        'Error',
        'Please select subscription',
      );

      return;
    }

    await instance.post(
      '/subscription-invoices',
      {

        subscription_id:
          selectedSubscription.id,

        invoice_number:
          `INV-${Date.now()}`,

        amount:
          selectedSubscription.plan
            ?.monthly_price ?? 0,

        tax: 0,

        discount: 0,

        total_amount:
          selectedSubscription.plan
            ?.monthly_price ?? 0,

        invoice_date:
          new Date()
            .toISOString()
            .split('T')[0],

        due_date:
          new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],

        status: 'pending',
      }
    );

    Alert.alert(
      'Success',
      'Invoice created successfully',
    );

    await loadInvoices();

    setMode('list');

  } catch (error) {

    console.log(
      'CREATE INVOICE ERROR:',
      error,
    );

    Alert.alert(
      'Error',
      'Failed to create invoice',
    );
  }
};
const handleUpdateInvoice = async () => {

  try {

    await updateSubscriptionInvoice(
      editing.id,
      {
        invoice_no: editing.invoiceNo,

        total_amount: Number(
          String(editing.amount)
            .replace('₹', '')
            .trim()
        ),

        invoice_date: editing.invoiceDate,

        due_date: editing.dueDate,

        status: editing.status,
      }
    );

    Alert.alert(
      'Success',
      'Invoice updated successfully',
    );

    await loadInvoices();

    setMode('list');

    setEditing(null);

    setShowStatusDropdown(false);

  } catch (error) {

    console.log(
      'UPDATE ERROR:',
      error,
    );

    Alert.alert(
      'Error',
      'Failed to update invoice',
    );
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
        <View>
          <Text h4 semibold style={styles.title}>
            Subscription Invoices
          </Text>
          <Text style={styles.subtitle}>Manage billing invoices</Text>
        </View>

        {mode === 'list' ? (
          <TouchableOpacity
            style={[styles.createButton, isMobile && styles.createButtonMobile]}
            onPress={handleCreate}>
            <Text semibold style={styles.createButtonText}>
              + CREATE INVOICE
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.backButton, isMobile && styles.backButtonMobile]}
            onPress={() => setMode('list')}>
            <Text semibold style={styles.backButtonText}>
              ← BACK
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {mode === 'list' ? (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableWrapper}>
              <View style={[styles.row, styles.header]}>
                <View style={styles.indexCell}>
                  <Text semibold style={styles.headerCell}>
                    #
                  </Text>
                </View>
                <View style={styles.invoiceNoCell}>
                  <Text semibold style={styles.headerCell}>
                    INVOICE NO
                  </Text>
                </View>
                <View style={styles.orgCell}>
                  <Text semibold style={styles.headerCell}>
                    ORGANIZATION
                  </Text>
                </View>
                <View style={styles.planCell}>
                  <Text semibold style={styles.headerCell}>
                    PLAN
                  </Text>
                </View>
                <View style={styles.amountCell}>
                  <Text semibold style={styles.headerCell}>
                    TOTAL AMOUNT
                  </Text>
                </View>
                <View style={styles.dateCell}>
                  <Text semibold style={styles.headerCell}>
                    INVOICE DATE
                  </Text>
                </View>
                <View style={styles.dateCell}>
                  <Text semibold style={styles.headerCell}>
                    DUE DATE
                  </Text>
                </View>
                <View style={styles.statusCell}>
                  <Text semibold style={styles.headerCell}>
                    STATUS
                  </Text>
                </View>
                <View style={styles.actionCell}>
                  <Text semibold style={styles.headerCell}>
                    ACTIONS
                  </Text>
                </View>
              </View>

              {invoices.map((inv, idx) => (
                <View key={inv.id} style={styles.row}>
                  <View style={styles.indexCell}>
                    <Text style={styles.cell}>{idx + 1}</Text>
                  </View>
                  <View style={styles.invoiceNoCell}>
                    <Text style={styles.cell}>{inv.invoiceNo}</Text>
                  </View>
                  <View style={styles.orgCell}>
                    <Text style={styles.cell}>{inv.organization}</Text>
                  </View>
                  <View style={styles.planCell}>
                    <Text style={styles.cell}>{inv.plan}</Text>
                  </View>
                  <View style={styles.amountCell}>
                    <Text style={styles.cell}>{inv.amount}</Text>
                  </View>
                  <View style={styles.dateCell}>
                    <Text style={styles.cell}>{inv.invoiceDate}</Text>
                  </View>
                  <View style={styles.dateCell}>
                    <Text style={styles.cell}>{inv.dueDate}</Text>
                  </View>
                  <View style={styles.statusCell}>
                    <Text style={{...styles.cell, ...styles.statusPill}}>
                      {inv.status}
                    </Text>
                  </View>
                  <View style={[styles.actionCell, styles.actionRow]}>
                    <TouchableOpacity onPress={() => handleEdit(inv)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="pencil" size={18} color={PRIMARY_DARK_PINK} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(inv)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="trash-can" size={18} color={PRIMARY_DARK_PINK} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : mode === 'create' ? (
        <View style={styles.formCard}>
          <Text semibold style={styles.sectionTitle}>
            Create Subscription Invoice
          </Text>
          <Text style={styles.label}>Select Subscription</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowSubscriptionDropdown((prev) => !prev)}>
            <Text style={styles.selectText}>
  {selectedSubscription
    ? `${selectedSubscription.organization?.name} - ${selectedSubscription.plan?.name}`
    : 'Choose Subscription'}
</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#667085" />
          </TouchableOpacity>
          {showSubscriptionDropdown && (
            <View style={styles.dropdownMenu}>
              {subscriptions.map((subscription: any) => (

  <TouchableOpacity
    key={subscription.id}
    style={styles.dropdownItem}
    onPress={() => {

      setSelectedSubscription(
        subscription,
      );

      setShowSubscriptionDropdown(
        false,
      );
    }}>

    <Text style={styles.dropdownItemText}>

      {subscription.organization?.name}

      {' - '}

      {subscription.plan?.name}

    </Text>

  </TouchableOpacity>
))}
            </View>
          )}
          <TouchableOpacity style={styles.primaryBtnFull} onPress={handleCreateSubmit}>
            <Text semibold style={styles.primaryBtnText}>
              CREATE INVOICE
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text semibold style={styles.sectionTitle}>
            Edit Invoice
          </Text>
          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowStatusDropdown((prev) => !prev)}>
            <Text style={styles.selectText}>{editing?.status || 'Pending'}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#667085" />
          </TouchableOpacity>
          {showStatusDropdown && (
            <View style={styles.dropdownMenu}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEditing((prev: any) => ({...(prev || {}), status}));
                    setShowStatusDropdown(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.primaryBtnFull} onPress={handleUpdateInvoice}>
            <Text semibold style={styles.primaryBtnText}>
              UPDATE INVOICE
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default SubscriptionInvoices;

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {padding: 16},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  headerRowMobile: {
    alignItems: 'stretch',
  },
  title: {color: '#1C2746'},
  subtitle: {color: '#667085', marginTop: 4, marginBottom: 16},
  createButton: {
    backgroundColor: PRIMARY_DARK_PINK,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  createButtonMobile: {
    width: '100%',
    minWidth: 0,
  },
  createButtonText: {color: '#fff', fontSize: 11},
  backButton: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 96,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backButtonMobile: {
    width: '100%',
  },
  backButtonText: {color: '#344054', fontSize: 11},
  tableContainer: {marginTop: 12},
  tableWrapper: {borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff'},
  row: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F3F7', alignItems: 'center'},
  header: {backgroundColor: '#F8FAFC'},
  headerCell: {paddingVertical: 12, paddingHorizontal: 10, color: '#334155'},
  cell: {paddingVertical: 12, paddingHorizontal: 10, color: '#334155'},
  indexCell: {width: 44},
  invoiceNoCell: {width: 160},
  orgCell: {width: 220},
  planCell: {width: 120},
  amountCell: {width: 120},
  dateCell: {width: 140},
  statusCell: {width: 110},
  actionCell: {width: 120},
  actionRow: {flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 8},
  iconButton: {padding: 8, marginLeft: 8},
  statusPill: {color: PRIMARY_DARK_PINK, fontWeight: '700'},
  formCard: {marginTop: 12, borderRadius: 10, backgroundColor: '#fff', padding: 16, borderWidth: 1, borderColor: '#E4E7EC'},
  sectionTitle: {fontSize: 16, color: '#1C2746', marginBottom: 12},
  label: {color: '#667085', marginBottom: 8},
  selectBox: {height: 46, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff', marginBottom: 12},
  selectText: {color: '#667085'},
  dropdownMenu: {borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 8, marginTop: -6, marginBottom: 12, overflow: 'hidden', backgroundColor: '#FFFFFF'},
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F7'},
  dropdownItemText: {color: '#344054', fontSize: 13},
  primaryBtnFull: {backgroundColor: PRIMARY_DARK_PINK, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center', marginTop: 8},
  primaryBtnText: {color: '#fff'},
});
