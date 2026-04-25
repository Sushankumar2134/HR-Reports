// Billing API
import instance from './axios';

export interface BillingRow {
  id?: string;
  receiptNo: string;
  patient: string;
  patientId?: string;
  patientCode?: string;
  mobile?: string;
  amount: number;
  mode: string;
  date: string;
  status?: string;
  service?: string;
  consultationFee?: number;
  total?: number;
  collectedBy?: string;
}

export interface BillingPayload {
  patientId: string;
  visitId: string;
  amount: number;
  mode: string;
}

export interface PatientOption {
  id: string;
  name: string;
}

// Mock data for billing list
const mockBillingData: BillingRow[] = [
  {
    id: '1',
    receiptNo: 'BL001',
    patient: 'John Doe',
    patientId: 'P001',
    patientCode: 'PAT-82609',
    mobile: '9507765133',
    amount: 5000,
    mode: 'Cash',
    date: '2024-04-20',
    status: 'Paid',
    service: 'Consultation Fee',
    consultationFee: 5000,
    total: 5000,
    collectedBy: 'Super Admin',
  },
  {
    id: '2',
    receiptNo: 'BL002',
    patient: 'Jane Smith',
    patientId: 'P002',
    patientCode: 'PAT-82610',
    mobile: '9507765134',
    amount: 7500,
    mode: 'Card',
    date: '2024-04-21',
    status: 'Paid',
    service: 'Consultation Fee',
    consultationFee: 7500,
    total: 7500,
    collectedBy: 'Super Admin',
  },
  {
    id: '3',
    receiptNo: 'BL003',
    patient: 'Robert Johnson',
    patientId: 'P003',
    patientCode: 'PAT-82611',
    mobile: '9507765135',
    amount: 3000,
    mode: 'Online',
    date: '2024-04-22',
    status: 'Paid',
    service: 'Consultation Fee',
    consultationFee: 3000,
    total: 3000,
    collectedBy: 'Super Admin',
  },
  {
    id: '4',
    receiptNo: 'BL004',
    patient: 'Maria Garcia',
    patientId: 'P004',
    patientCode: 'PAT-82612',
    mobile: '9507765136',
    amount: 6000,
    mode: 'Cash',
    date: '2024-04-23',
    status: 'Paid',
    service: 'Consultation Fee',
    consultationFee: 6000,
    total: 6000,
    collectedBy: 'Super Admin',
  },
];



/**
 * Fetch all billing records
 */
const normalizeBillingRow = (item: any): BillingRow => ({
  id: item?.id ? String(item.id) : undefined,
  receiptNo: String(item?.receipt_no ?? item?.receiptNo ?? ''),
  patient: item?.patient
    ? `${item.patient.first_name ?? ''} ${item.patient.last_name ?? ''}`.trim()
    : String(item?.patient_name ?? item?.patient ?? 'Unknown'),
  patientId: String(item?.patient_id ?? item?.patientId ?? ''),
  patientCode: String(
    item?.patient_code ?? item?.patientCode ?? item?.patient_id ?? item?.patientId ?? '',
  ),
  mobile: String(item?.mobile ?? item?.patient_mobile ?? item?.phone ?? ''),
  amount: Number(item?.amount ?? 0),
  mode: String(item?.payment_mode ?? item?.mode ?? 'Cash'),
  date: String(item?.created_at ?? item?.date ?? '').split('T')[0],
  status: String(item?.status ?? 'Paid'),
  service: String(item?.service ?? 'Consultation Fee'),
  consultationFee: Number(item?.consultation_fee ?? item?.consultationFee ?? item?.amount ?? 0),
  total: Number(item?.total ?? item?.amount ?? 0),
  collectedBy: String(item?.collected_by ?? item?.collectedBy ?? 'Super Admin'),
});
export const getBillingList = async (): Promise<BillingRow[]> => {
  try {
    const response = await instance.get('/billing');

    const apiData = response?.data?.data;

    if (Array.isArray(apiData)) {
      return apiData.map((item: any) => ({
        id: item.id,
        receiptNo: item.receipt_no,

        // ✅ FIXED: combine first and last name
        patient: item.patient
          ? `${item.patient.first_name} ${item.patient.last_name}`
          : 'Unknown',

        patientId: item.patient_id,
        amount: Number(item.amount),
        mode: item.payment_mode,
        date: item.created_at?.split('T')[0],
      }));
    }

    return [];

  } catch (error) {
    console.log('Error fetching billing list:', error);
    return [];
  }
};
/**
 * Create a new billing record
 */
export const createBilling = async (
  payload: BillingPayload,
): Promise<BillingRow> => {
  try {
    const response = await instance.post('/billing', {
  patient_id: payload.patientId,
  visit_id: payload.visitId,
  amount: payload.amount,
  payment_mode: payload.mode,
});


    // Generate receipt number and current date
    const receiptNo = `BL${String(mockBillingData.length + 1).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    // Get patient name from ID
    const patient = 'Saved Patient';

    const newBilling: BillingRow = {
      id: response?.data?.id || String(mockBillingData.length + 1),
      receiptNo,
      patient,
      patientId: payload.patientId,
      patientCode: payload.patientId,
      mobile: '',
      amount: payload.amount,
      mode: payload.mode,
      date,
      status: 'Paid',
      service: 'Consultation Fee',
      consultationFee: payload.amount,
      total: payload.amount,
      collectedBy: 'Super Admin',
    };

    // Add to mock data
    mockBillingData.push(newBilling);

    return newBilling;
  } catch (error) {
console.log(
  'Error creating billing record:',
  (error as any)?.response?.data
);

    // Create mock record on error
    const receiptNo = `BL${String(mockBillingData.length + 1).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

      const patient = 'Saved Patient';

    const newBilling: BillingRow = {
      id: String(mockBillingData.length + 1),
      receiptNo,
      patient,
      patientId: payload.patientId,
      patientCode: payload.patientId,
      mobile: '',
      amount: payload.amount,
      mode: payload.mode,
      date,
      status: 'Paid',
      service: 'Consultation Fee',
      consultationFee: payload.amount,
      total: payload.amount,
      collectedBy: 'Super Admin',
    };

    mockBillingData.push(newBilling);
    return newBilling;
  }
};

/**
 * Get list of patients
 */
export const getPatients = async (): Promise<PatientOption[]> => {
  try {
    const response = await instance.get('/patients');

    const apiData = response?.data;

    // Handle different API response structures
    const patientsArray = Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.data)
      ? apiData.data
      : Array.isArray(apiData?.patients)
      ? apiData.patients
      : [];

    // Normalize patient names from first_name + last_name
    return patientsArray.map((item: any) => ({
      id: String(item.id),
      name:
        item.name ||
        `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim(),
    }));

  } catch (error) {
    console.log('Error fetching patients:', error);

    // IMPORTANT: return empty list instead of mock
    return [];
  }
};
/**
 * Delete a billng record
 */
export const deleteBilling = async (id: string): Promise<boolean> => {
  try {
    await instance.delete(`/billing/${id}`);
    const index = mockBillingData.findIndex(b => b.id === id);
    if (index > -1) {
      mockBillingData.splice(index, 1);
    }
    return true;
  } catch (error) {
    console.log('Error deleting billing record:', error);
    return false;
  }
};
