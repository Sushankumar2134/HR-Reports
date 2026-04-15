export type ScanTypeStatus = 'Active' | 'Inactive';
export type ScanPriority = 'Normal' | 'Urgent';
export type ScanStatus =
  | 'Pending'
  | 'Uploaded'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export interface IRadiologyDashboardStats {
  totalScans: number;
  pending: number;
  uploaded: number;
  approved: number;
}

export interface IRadiologyOption {
  id: number | string;
  label: string;
}

export interface IScanType {
  id: number | string;
  name: string;
  description?: string;
  status: ScanTypeStatus;
}

export interface IScanRequest {
  id: number | string;
  patientId?: number | string;
  patientName: string;
  scanTypeId?: number | string;
  scanTypeName: string;
  bodyPart: string;
  reason?: string;
  priority: ScanPriority;
  doctorId?: number | string;
  doctorName?: string;
  status: ScanStatus;
}

export interface IScheduledScan {
  id: number | string;
  scanRequestId: number | string;
  patientName: string;
  bodyPart: string;
  date: string;
  time: string;
  status: ScanStatus;
}

export interface IUploadedScan {
  id: number | string;
  patientName: string;
  fileName: string;
  fileType?: string;
  fileUrl?: string;
}

export interface IRadiologyReviewItem {
  id: number | string;
  patientName: string;
  scanTypeName: string;
  filesCount: number;
  reportId?: number | string;
}

export interface IRadiologyReport {
  id: number | string;
  patientName: string;
  scanTypeName: string;
  bodyPart?: string;
  observations?: string;
  findings?: string;
  diagnosis?: string;
}

export interface IScanHistoryItem {
  id: number | string;
  patientName: string;
  scanTypeName: string;
  status: ScanStatus;
  date: string;
}
