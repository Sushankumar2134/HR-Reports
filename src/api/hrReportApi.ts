// HR Reports API
import instance from './axios';
import {BASE_URL} from './api';

export interface HRDashboardSummary {
  totalEmployees: number;
  totalReports: number;
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDashboardSummary = (payload: any): HRDashboardSummary => {
  const data = payload?.data ?? payload ?? {};

  const totalEmployees =
    toNumber(data.totalEmployees) ||
    toNumber(data.total_employees) ||
    toNumber(data.employeeCount) ||
    toNumber(data.employee_count) ||
    toNumber(data.staffCount) ||
    toNumber(data.staff_count);

  const totalReports =
    toNumber(data.totalReports) ||
    toNumber(data.total_reports) ||
    toNumber(data.reportCount) ||
    toNumber(data.report_count) ||
    6;

  return {
    totalEmployees,
    totalReports,
  };
};

export const getHRDashboardSummary = async (): Promise<HRDashboardSummary> => {
  try {
    const response = await instance.get('/admin/reports');
    return normalizeDashboardSummary(response.data);
  } catch {
    try {
      const response = await instance.get(`${BASE_URL}/admin/reports`);
      return normalizeDashboardSummary(response.data);
    } catch (error) {
      console.log('Error fetching dashboard summary:', error);
      return {
        totalEmployees: 0,
        totalReports: 6,
      };
    }
  }
};

export interface StaffRow {
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
}

const normalizeStaffRows = (payload: any): StaffRow[] => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return list.map((row: any) => ({
    employeeId: String(row.employeeId ?? row.employee_id ?? ''),
    name: String(row.name ?? ''),
    department: String(row.department ?? row.department_name ?? ''),
    designation: String(row.designation ?? ''),
    status: String(row.status ?? '').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  }));
};

export interface AttendanceRow {
  employeeId: string;
  name: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workingHours: number;
  status: string;
  lateMinutes: number;
  overtimeMinutes: number;
}

export interface LeaveRow {
  employeeId: string;
  name: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  approvedBy: string;
  days: number;
}

export interface PayrollRow {
  id?: string | number;
  employeeId: string;
  name: string;
  department: string;
  basic: number;
  allowances: number;
  deductions: number;
  gross: number;
  net: number;
  pf: number;
  esi: number;
  tax: number;
  status: string;
}

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const stripHtml = (value: string) =>
  decodeHtmlEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

const parseCurrency = (value: string) => {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePayrollRows = (payload: string | any): PayrollRow[] => {
  const html = typeof payload === 'string' ? payload : String(payload?.data ?? payload ?? '');
  const tableRows = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));

  const rows: PayrollRow[] = [];

  tableRows.forEach((match) => {
    const rowHtml = match[1] || '';
    const cellMatches = Array.from(rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi));
    const cells = cellMatches.map((cellMatch) => stripHtml(cellMatch[1] || ''));

    if (cells.length < 5) {
      return;
    }

    const hasHeader = cells.some((cell) => /employee|emp id|name|department/i.test(cell));
    if (hasHeader) {
      return;
    }

    rows.push({
      id: cells[0] || undefined,
      employeeId: cells[1] || cells[0] || '',
      name: cells[2] || '',
      department: cells[3] || '-',
      basic: parseCurrency(cells[4]),
      allowances: parseCurrency(cells[5]),
      pf: parseCurrency(cells[6]),
      esi: parseCurrency(cells[7]),
      tax: parseCurrency(cells[8]),
      deductions: parseCurrency(cells[9]),
      gross: parseCurrency(cells[10]),
      net: parseCurrency(cells[11]),
      status: cells[12] || 'Processed',
    });
  });

  return rows;
};

export interface OvertimeRow {
  employeeId: string;
  name: string;
  department: string;
  shift: string;
  date: string;
  otHours: number;
  rate: number;
  amount: number;
}

export interface DepartmentSalaryRow {
  department: string;
  totalEmployees: number;
  totalSalary: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
}

const normalizeDepartmentSalaryRows = (payload: any): DepartmentSalaryRow[] => {
  const asString = String(payload ?? '');

  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
      ? parsed.data
      : [];

    if (list.length) {
      return list.map((item: any) => ({
        department: String(item.department ?? item.department_name ?? 'Unknown'),
        totalEmployees: toNumber(item.totalEmployees ?? item.total_employees),
        totalSalary: toNumber(item.totalSalary ?? item.total_salary),
        averageSalary: toNumber(item.averageSalary ?? item.average_salary),
        highestSalary: toNumber(item.highestSalary ?? item.highest_salary),
        lowestSalary: toNumber(item.lowestSalary ?? item.lowest_salary),
      }));
    }
  } catch {
    // Continue with HTML parsing fallback.
  }

  const tableRows = Array.from(asString.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  const rows: DepartmentSalaryRow[] = [];

  tableRows.forEach((match) => {
    const rowHtml = match[1] || '';
    const cellMatches = Array.from(rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi));
    const cells = cellMatches.map((cellMatch) => stripHtml(cellMatch[1] || ''));

    if (cells.length < 6) {
      return;
    }

    const hasHeader = /department|total employees|average salary/i.test(cells.join(' '));
    if (hasHeader) {
      return;
    }

    rows.push({
      department: cells[0] || 'Unknown',
      totalEmployees: toNumber(cells[1]),
      totalSalary: parseCurrency(cells[2]),
      averageSalary: parseCurrency(cells[3]),
      highestSalary: parseCurrency(cells[4]),
      lowestSalary: parseCurrency(cells[5]),
    });
  });

  return rows;
};
// Staff Strength API
export const getStaffStrengthReport = async (): Promise<StaffRow[]> => {
  try {
    const response = await instance.get('/api/reports/staff-strength');

    const rows = normalizeStaffRows(response.data);

    return rows.length ? rows : getMockStaffData();

  } catch {
    try {
      const response = await instance.get(`${BASE_URL}/api/reports/staff-strength`);

      const rows = normalizeStaffRows(response.data);

      return rows.length ? rows : getMockStaffData();

    } catch (error) {

      console.error('Error fetching staff strength:', error);

      return getMockStaffData();
    }
  }
};
export interface DepartmentOption {
  id: string | null;
  department_name: string;
} 
export const getDepartments = async () => {
  try {
    const response = await instance.get(
      "/departments"
    );

    console.log(
      "Departments API full:",
      response.data
    );

    // IMPORTANT — return only the array
    return response.data?.data || [];

  } catch (error) {
    console.log(
      "Error fetching departments:",
      error
    );

    return [];
  }
};
export const getAttendanceReport = async (
  fromDate?: string,
  toDate?: string,
  department?: string,
  status?: string,
) => {
  try {
    const response = await instance.get(
      '/reports/attendance',
      {
        params: {
          from_date: fromDate,
          to_date: toDate,
          department_id: department,
          status: status,
        },
      }
    );

    console.log(
      "Attendance API Response:",
      response.data
    );

    // CASE 1 — Proper API response
    if (response.data?.attendance) {
      return {
        attendance: response.data.attendance,
        departments: response.data.departments || [],
      };
    }

    // CASE 2 — Only attendance array returned
    if (Array.isArray(response.data)) {
      return {
        attendance: response.data,
        departments: [],
      };
    }

    return {
      attendance: [],
      departments: [],
    };

  } catch (error: any) {
    console.log(
      "Error fetching attendance:",
      error.message
    );

    return {
      attendance: [],
      departments: [],
    };
  }
};
// Leave API
export const getLeaveReport = async (
  fromDate?: string,
  toDate?: string,
  department?: string,
  status?: string,
) => {
  try {
    const response = await instance.get('/hr/leave', {
      params: {fromDate, toDate, department, status},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leave data:', error);
    return [];
  }
};

export const getPayrollReport = async (): Promise<PayrollRow[]> => {
  try {
    const response = await instance.get(
      `${BASE_URL}/api/reports/payroll`
    );

    console.log("Payroll API:", response.data);

    return response.data;

  } catch (error) {
    console.error("Error fetching payroll:", error);

    return getMockPayrollData();
  }
};

export const getPayrollPayslipUrl = (idOrEmployeeId: string | number) => {
  const identifier = encodeURIComponent(String(idOrEmployeeId));
  return `${BASE_URL}/admin/reports/payroll/payslip/${identifier}`;
};

// Overtime API
export const getOvertimeReport = async (
  fromDate?: string,
  toDate?: string,
  employee?: string,
  department?: string,
) => {
  try {
    const response = await instance.get('/hr/overtime', {
      params: {fromDate, toDate, employee, department},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching overtime:', error);
    return [];
  }
};

// Department Salary API
export const getDepartmentSalaryReport = async () => {
  try {
    const response = await instance.get(`${BASE_URL}/admin/reports/department-salary`, {
      responseType: 'text',
      headers: {Accept: 'application/json,text/html,application/xhtml+xml'},
    });

    const rows = normalizeDepartmentSalaryRows(response.data);
    return rows.length ? rows : getMockDepartmentSalaryData();
  } catch (error) {
    console.error('Error fetching department salary:', error);
    return getMockDepartmentSalaryData();
  }
};

// Mock data functions
const getMockStaffData = (): StaffRow[] => [
  {
    employeeId: 'EMP-0001',
    name: 'Munna',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
  {
    employeeId: 'EMP-0002',
    name: 'jimmyy',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Inactive',
  },
  {
    employeeId: 'EMP-0003',
    name: 'munna',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
  {
    employeeId: 'EMP-0004',
    name: 'pavan',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
  {
    employeeId: 'EMP-0005',
    name: 'pavankumar',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
  {
    employeeId: 'EMP-0006',
    name: 'kdarshan',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
  {
    employeeId: 'EMP-0007',
    name: 'akarsh',
    department: 'emergencyhosptialManglore',
    designation: 'Surgeonofficer123',
    status: 'Active',
  },
];

const getMockPayrollData = (): PayrollRow[] => {
  const staffData = getMockStaffData();
  return staffData.map((staff) => ({
    employeeId: staff.employeeId,
    name: staff.name,
    department: '-',
    basic: 0,
    allowances: 0,
    deductions: 0,
    gross: 0,
    net: 0,
    pf: 0,
    esi: 0,
    tax: 0,
    status: 'Processed',
  }));
};

const getMockDepartmentSalaryData = (): DepartmentSalaryRow[] => [
  {
    department: 'Unknown',
    totalEmployees: 7,
    totalSalary: 0,
    averageSalary: 0,
    highestSalary: 0,
    lowestSalary: 0,
  },
];
