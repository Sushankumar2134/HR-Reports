import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {Button, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
import {createBilling, getPatients, PatientOption} from '../../api/billing';

const BillingEntry = ({navigation}: any) => {
  const {sizes, colors} = useTheme();
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(
    null,
  );
  const [visitId, setVisitId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const PAYMENT_MODES = ['Cash', 'Card', 'Online', 'Cheque'];

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      const normalizedPatients = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray((data as any)?.patients)
        ? (data as any).patients
        : [];

      setPatients(
        normalizedPatients.filter(
          (patient: any) => patient && typeof patient.id !== 'undefined',
        ),
      );
    } catch (error) {
      console.log('Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!selectedPatient) {
      Alert.alert('Validation Error', 'Please select a patient');
      return;
    }

    if (!visitId.trim()) {
      Alert.alert('Validation Error', 'Please enter visit ID');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Validation Error', 'Please enter amount');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!paymentMode) {
      Alert.alert('Validation Error', 'Please select payment mode');
      return;
    }

    try {
      setLoading(true);
      await createBilling({
        patientId: selectedPatient.id,
        visitId,
        amount: Number(amount),
        mode: paymentMode,
      });

      Alert.alert('Success', 'Billing record created successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedPatient(null);
            setVisitId('');
            setAmount('');
            setPaymentMode('Cash');
            // Navigate back to billing list
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.log('Error creating billing:', error);
      Alert.alert('Error', 'Failed to create billing record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Billing Entry
      </Text>

      {/* Patient Selection */}
      <View style={styles.section}>
        <Text size={14} semibold color={colors.text}>
          Patient
        </Text>
        <TouchableSelectField
          value={selectedPatient?.name || 'Select Patient'}
          onPress={() => setShowPatientDropdown(!showPatientDropdown)}
          editable={true}
        />
        {showPatientDropdown && (
          <View style={styles.dropdown}>
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator>
              {patients.map((patient, index) => (
                <TouchableOpacity
                  key={String(patient.id)}
                  style={[
                    styles.dropdownItem,
                    index === patients.length - 1 && styles.dropdownItemLast,
                  ]}
                  onPress={() => {
                    setSelectedPatient(patient);
                    setShowPatientDropdown(false);
                  }}>
                  <Text size={13} color={colors.text}>
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Visit ID */}
      <View style={styles.section}>
        <Text size={14} semibold color={colors.text}>
          Visit ID
        </Text>
        <Input
          placeholder="Enter Visit ID"
          value={visitId}
          onChangeText={setVisitId}
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Amount */}
      <View style={styles.section}>
        <Text size={14} semibold color={colors.text}>
          Amount
        </Text>
        <Input
          placeholder="Enter Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Payment Mode */}
      <View style={styles.section}>
        <Text size={14} semibold color={colors.text}>
          Payment Mode
        </Text>
        <View style={styles.paymentModeContainer}>
          {PAYMENT_MODES.map((mode) => (
            <PaymentModeButton
              key={mode}
              mode={mode}
              selected={paymentMode === mode}
              onPress={() => setPaymentMode(mode)}
              colors={colors}
            />
          ))}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonSection}>
        <Button
          primary
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}>
          <Text white semibold size={14}>
            {loading ? 'SAVING...' : 'SAVE'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};

const TouchableSelectField = ({
  value,
  onPress,
  editable,
}: {
  value: string;
  onPress: () => void;
  editable: boolean;
}) => {
  const {colors} = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!editable}
      style={[
        styles.selectFieldContainer,
        {borderColor: colors.focus, backgroundColor: colors.card},
      ]}>
      <Text size={13} color={colors.text}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const PaymentModeButton = ({
  mode,
  selected,
  onPress,
  colors,
}: {
  mode: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.paymentModeButton,
      {
        backgroundColor: selected ? colors.primary : colors.light,
        borderColor: selected ? colors.primary : colors.gray,
      },
    ]}>
    <Text
      size={12}
      semibold
      color={selected ? colors.white : colors.text}
      center>
      {mode}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  selectFieldContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  paymentModeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  paymentModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
  },
  buttonSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
  },
});

export default BillingEntry;
