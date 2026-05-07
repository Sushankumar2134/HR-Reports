// RefundAPI.ts
import instance from './axios';

export interface PatientOption {
  id: string | number;
  name: string;
}

export interface RefundRow {
  id: string | number;
  refundNo: string;
  patient: string;
  patientId: string | number;
  refundType: string;
  billType: string;
  amount: number;
  status: string;
  date: string;
}

export interface CreateRefundPayload {
  patientId: string | number;
  refundType: string;
  billType: string;
  refundAmount: number;
  refundReason: string;
  remarks: string;
  refundDate: string;
  billId?: string;
  supportingDocument?: any;
}

// Get all refunds
export const getRefundList = async (): Promise<RefundRow[]> => {
  try {
    const response = await instance.get('/refunds');
    const data = Array.isArray(response.data)
  ? response.data
  : Array.isArray((response.data as any)?.data?.data)
  ? (response.data as any).data.data
  : Array.isArray((response.data as any)?.refunds)
  ? (response.data as any).refunds
  : [];
    return data.map((item: any) => ({
  id: item.id || item._id,

  refundNo:
    item.id
      ? `REF-${item.id}`
      : `REF${Date.now()}`,

  patient: item.patient
    ? `${item.patient.first_name || ''} ${item.patient.last_name || ''}`
    : '-',

  patientId:
    item.patient_id,

  refundType:
    item.refund_type || '-',

  billType:
    item.bill_type || '-',

  amount: Number(
    item.refund_amount || 0,
  ),

  status:
    item.status || 'Pending',

  date:
    item.refund_date ||
    item.created_at ||
    '',
}));
  } catch (error) {
    console.log('Error fetching refunds:', error);
    throw error;
  }
};

// Get patients for dropdown
export const getPatients = async (): Promise<PatientOption[]> => {
  try {
    const response = await instance.get('/patients');
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : Array.isArray((response.data as any)?.patients)
      ? (response.data as any).patients
      : [];

  return data.map((patient: any) => ({
  id: patient.id || patient._id,

  name: `${patient.first_name || ''} ${patient.last_name || ''}`,
}));
  } catch (error) {
    console.log('Error fetching patients:', error);
    throw error;
  }
};

// Create a new refund
export const createRefund = async (payload: CreateRefundPayload) => {
  try {
   const response = await instance.post(
  '/refunds',
  {
    patient_id: payload.patientId,

    refund_type: payload.refundType,

    bill_type: payload.billType,

    refund_amount: payload.refundAmount,

    refund_reason: payload.refundReason,

    remarks: payload.remarks,

    refund_date: payload.refundDate,

    bill_id: payload.billId,
  },
);
    return response.data;
  } catch (error) {
    console.log('Error creating refund:', error);
    throw error;
  }
};

// Delete a refund
export const deleteRefund = async (refundId: string | number) => {
  try {
    const response = await instance.delete(`/refunds/${refundId}`);
    return response.data;
  } catch (error) {
    console.log('Error deleting refund:', error);
    throw error;
  }
};

// Get refund by ID
export const getRefundById = async (refundId: string | number) => {
  try {
    const response = await instance.get(`/refunds/${refundId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching refund:', error);
    throw error;
  }
};

// Update refund status
export const updateRefundStatus = async (
  refundId: string | number,
  status: string,
) => {
  try {
    const response = await instance.put(`/refunds/${refundId}`, {status});
    return response.data;
  } catch (error) {
    console.log('Error updating refund status:', error);
    throw error;
  }
};
// Update refund
export const updateRefund = async (
  refundId: string | number,
  payload: CreateRefundPayload,
) => {
  try {
    const response = await instance.put(
      `/refunds/${refundId}`,
      {
        patient_id: payload.patientId,

        refund_type: payload.refundType,

        bill_type: payload.billType,

        refund_amount: payload.refundAmount,

        refund_reason: payload.refundReason,

        remarks: payload.remarks,

        refund_date: payload.refundDate,

        bill_id: payload.billId,
      },
    );

    return response.data;
  } catch (error) {
    console.log('Error updating refund:', error);
    throw error;
  }
};