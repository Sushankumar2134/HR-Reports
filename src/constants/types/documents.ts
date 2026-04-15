import {IUser} from './index';

export type DocumentType =
  | 'offer_letter'
  | 'appointment_letter'
  | 'id_proof'
  | 'certificate'
  | 'medical_license';

export type UserRole = 'hr' | 'admin' | 'employee';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'valid';

export interface IEmployee extends IUser {
  employeeId?: string;
  position?: string;
  joinDate?: string;
}

export interface IDocument {
  id?: number | string;
  employee_id?: number | string;
  employee?: IEmployee;
  document_type?: DocumentType;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  expiry_date?: string; // ISO date string
  description?: string;
  uploaded_by?: number | string;
  created_at?: string;
  updated_at?: string;
  status?: ExpiryStatus;
}

export interface IDocumentStats {
  total?: number;
  expiringsoon?: number;
  expired?: number;
}

export interface IDocumentFilter {
  employee_id?: number | string;
  document_type?: DocumentType;
  expiry_status?: ExpiryStatus;
  search?: string;
}

export const DOCUMENT_TYPES: {key: DocumentType; label: string}[] = [
  {key: 'offer_letter', label: 'Offer Letter'},
  {key: 'appointment_letter', label: 'Appointment Letter'},
  {key: 'id_proof', label: 'ID Proof'},
  {key: 'certificate', label: 'Certificate'},
  {key: 'medical_license', label: 'Medical License'},
  
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  offer_letter: 'Offer Letter',
  appointment_letter: 'Appointment Letter',
  id_proof: 'ID Proof',
  certificate: 'Certificate',
  medical_license: 'Medical License',
};

export const REQUIRES_EXPIRY: DocumentType[] = [
  'certificate',
  'medical_license',
];
