import instance from './axios';

export type SubscriptionStatus = 'Active' | 'Inactive';

export interface SubscriptionPlan {
	id: string;
	planName: string;
	slug: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	trialDays: number;
	graceDays: number;
	maxUsers: number;
	maxPatients: number;
	maxHospitals: number;
	storageLimitMb: number;
	status: SubscriptionStatus;
	modules: string[];
}

export interface SubscriptionPlanPayload {
	planName: string;
	slug: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	trialDays: number;
	graceDays: number;
	maxUsers: number;
	maxPatients: number;
	maxHospitals: number;
	storageLimitMb: number;
	status: SubscriptionStatus;
	modules: string[];
}

const now = Date.now();
let subscriptionPlanCache: SubscriptionPlan[] = [];

const parseListData = (responseData: any): any[] => {
	if (Array.isArray(responseData)) {
		return responseData;
	}

	if (Array.isArray(responseData?.data)) {
		return responseData.data;
	}

	if (Array.isArray(responseData?.data?.data)) {
		return responseData.data.data;
	}

	if (Array.isArray(responseData?.plans)) {
		return responseData.plans;
	}

	if (Array.isArray(responseData?.subscriptionPlans)) {
		return responseData.subscriptionPlans;
	}

	return [];
};
const normalizePlan = (item: any): SubscriptionPlan => ({
	id: String(item?.id ?? item?._id ?? Date.now()),

	planName: String(
		item?.name ??
		item?.plan_name ??
		item?.planName ??
		''
	),

	slug: String(item?.slug ?? ''),

	description: String(item?.description ?? ''),

	monthlyPrice: Number(
		item?.monthly_price ??
		item?.monthlyPrice ??
		0
	),

	yearlyPrice: Number(
		item?.yearly_price ??
		item?.yearlyPrice ??
		0
	),

	trialDays: Number(
		item?.trial_days ??
		item?.trialDays ??
		0
	),

	graceDays: Number(
		item?.grace_days ??
		item?.graceDays ??
		0
	),

	maxUsers: Number(
		item?.max_users ??
		item?.maxUsers ??
		0
	),

	maxPatients: Number(
		item?.max_patients ??
		item?.maxPatients ??
		0
	),

	maxHospitals: Number(
		item?.max_staff ??
		item?.maxHospitals ??
		0
	),

	storageLimitMb: Number(
		item?.max_storage_mb ??
		item?.storage_limit_mb ??
		item?.storageLimitMb ??
		0
	),

	status:
		item?.status === 1 ||
		item?.status === '1' ||
		item?.is_active === 1
			? 'Active'
			: 'Inactive',

	modules: Array.isArray(item?.modules)
		? item.modules
		: [],
});const mapPayload = (payload: SubscriptionPlanPayload) => ({
	name: payload.planName,

	slug: payload.slug,

	description: payload.description,

	monthly_price: payload.monthlyPrice,

	yearly_price: payload.yearlyPrice,

	trial_days: payload.trialDays,

	grace_days: payload.graceDays,

	max_users: payload.maxUsers,

	max_patients: payload.maxPatients,

	max_staff: payload.maxHospitals,

	max_storage_mb: payload.storageLimitMb,

	status: payload.status === 'Active' ? 1 : 0,

	modules: payload.modules,
});
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
	try {

		const response = await instance.get('/subscription-plans');

		console.log('RAW RESPONSE:', response.data);

		const rows = parseListData(response.data).map(normalizePlan);

		console.log('NORMALIZED ROWS:', rows);

		if (rows.length > 0) {

			subscriptionPlanCache = rows;

			return rows;
		}

		return [];

	} catch (error: any) {

		console.log('FULL ERROR:', error);

		console.log('ERROR RESPONSE:', error?.response);

		console.log('ERROR DATA:', error?.response?.data);

		console.log('ERROR STATUS:', error?.response?.status);
return [];
	}
};
export const createSubscriptionPlan = async (
	payload: SubscriptionPlanPayload,
): Promise<SubscriptionPlan> => {
	try {
		const response = await instance.post('/subscription-plans', mapPayload(payload));
		const plan = normalizePlan(response?.data?.data ?? response?.data);
		subscriptionPlanCache = [plan, ...subscriptionPlanCache];
		return plan;
	} catch (error) {
		console.log('Error creating subscription plan:', error);

		const fallbackPlan: SubscriptionPlan = {
			id: String(Date.now()),
			...payload,
		};

		subscriptionPlanCache = [fallbackPlan, ...subscriptionPlanCache];
		return fallbackPlan;
	}
};

export const updateSubscriptionPlan = async (
	planId: string,
	payload: SubscriptionPlanPayload,
): Promise<SubscriptionPlan> => {
	try {
		const response = await instance.put(`/subscription-plans/${planId}`, mapPayload(payload));
		const updatedPlan = normalizePlan(response?.data?.data ?? response?.data);

		subscriptionPlanCache = subscriptionPlanCache.map((plan) =>
			plan.id === planId ? updatedPlan : plan,
		);

		return updatedPlan;
	} catch (error) {
		console.log('Error updating subscription plan:', error);

		const fallbackPlan: SubscriptionPlan = {
			id: planId,
			...payload,
		};

		subscriptionPlanCache = subscriptionPlanCache.map((plan) =>
			plan.id === planId ? fallbackPlan : plan,
		);

		return fallbackPlan;
	}
};

export const deleteSubscriptionPlan = async (
	planId: string,
): Promise<void> => {
	try {

		console.log('DELETING PLAN ID:', planId);

		const response = await instance.delete(
			`/subscription-plans/${planId}`
		);

		console.log('DELETE RESPONSE:', response.data);

		subscriptionPlanCache = subscriptionPlanCache.filter(
			(plan) => plan.id !== planId,
		);

	} catch (error: any) {

		console.log('DELETE ERROR:', error);

		console.log('DELETE ERROR RESPONSE:', error?.response);

		console.log('DELETE ERROR DATA:', error?.response?.data);
	}
};
export interface OrganizationSubscription {
	id: string;
	organization: string;
	plan: string;
	startDate: string;
	expiryDate: string;
	status: string;
	autoRenew: boolean;
}

const normalizeOrganizationSubscription = (
	item: any,
): OrganizationSubscription => ({
	id: String(item?.id ?? ''),

	organization:
		item?.organization?.name ??
		item?.organization_name ??
		'N/A',

	plan:
		item?.plan?.name ??
		item?.plan_name ??
		'N/A',

	startDate:
		String(
			item?.start_date ??
			''
		),

	expiryDate:
		String(
			item?.expiry_date ??
			''
		),

	status:
	String(
		item?.status ??
		'Active'
	),

	autoRenew:
		Boolean(
			item?.auto_renew
		),
});
export const updateOrganizationSubscription = async (
	id: string,
	payload: any,
) => {

	try {

		const response = await instance.put(
			`/subscriptions/${id}`,
			{
				organization_id: payload.organization_id,
				plan_id: payload.plan_id,
				start_date: payload.startDate,
				expiry_date: payload.expiryDate,
				status: payload.status.toLowerCase(),
				auto_renew: payload.autoRenew ? 1 : 0,
			},
		);

		console.log(
			'UPDATE SUBSCRIPTION RESPONSE:',
			response.data,
		);

		return response.data;

	} catch (error: any) {

		console.log(
			'UPDATE SUBSCRIPTION ERROR:',
			error,
		);

		throw error;
	}
};

export const deleteOrganizationSubscription = async (
	id: string,
) => {

	try {

		const response = await instance.delete(
			`/subscriptions/${id}`,
		);

		console.log(
			'DELETE SUBSCRIPTION RESPONSE:',
			response.data,
		);

		return response.data;

	} catch (error: any) {

		console.log(
			'DELETE SUBSCRIPTION ERROR:',
			error,
		);

		throw error;
	}
};
export const getOrganizationSubscriptions = async (): Promise<
	OrganizationSubscription[]
> => {
	try {

		const response = await instance.get('/subscriptions');

		console.log(
			'ORGANIZATION SUBSCRIPTIONS:',
			response.data,
		);

		const rows = parseListData(response.data).map(
			normalizeOrganizationSubscription,
		);

		console.log(
			'NORMALIZED ORGANIZATION SUBSCRIPTIONS:',
			rows,
		);

		return rows;

	} catch (error: any) {

		console.log(
			'ORGANIZATION SUBSCRIPTION ERROR:',
			error,
		);

		return [];
	}
};
export const getOrganizations = async () => {

	try {

		const response = await instance.get(
			'/organizations'
		);

		console.log(
			'ORGANIZATIONS:',
			response.data,
		);

		return parseListData(response.data);

	} catch (error) {

		console.log(
			'ORGANIZATION FETCH ERROR:',
			error,
		);

		return [];
	}
};

export const getPlansDropdown = async () => {

	try {

		const response = await instance.get(
			'/subscription-plans'
		);

		console.log(
			'PLANS DROPDOWN:',
			response.data,
		);

		return parseListData(response.data);

	} catch (error) {

		console.log(
			'PLANS FETCH ERROR:',
			error,
		);

		return [];
	}
};
export const createOrganizationSubscription = async (
	payload: any,
) => {

	try {

		const response = await instance.post(
			'/subscriptions',
			{
				organization_id: payload.organization_id,
				plan_id: payload.plan_id,
				start_date: payload.startDate,
				expiry_date: payload.expiryDate,
				status: payload.status.toLowerCase(),
				auto_renew: payload.autoRenew ? 1 : 0,
			},
		);

		console.log(
			'CREATE SUBSCRIPTION RESPONSE:',
			response.data,
		);

		return response.data;

	} catch (error: any) {

		console.log(
			'CREATE SUBSCRIPTION ERROR:',
			error,
		);

		throw error;
	}
};
export const updateSubscriptionInvoice = async (
  id: string,
  payload: any,
) => {

  try {

    const response = await instance.put(
      `/subscription-invoices/${id}`,
      {
        subscription_id:
          payload.subscription_id,

        invoice_no:
          payload.invoiceNo,

        total_amount:
          payload.amount,

        invoice_date:
          payload.invoiceDate,

        due_date:
          payload.dueDate,

        status:
          payload.status,
      },
    );

    console.log(
      'UPDATE INVOICE:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'UPDATE INVOICE ERROR:',
      error,
    );

    throw error;
  }
};
export const deleteSubscriptionInvoice = async (
  id: string,
) => {

  try {

    const response = await instance.delete(
      `/subscription-invoices/${id}`
    );

    console.log(
      'DELETE INVOICE:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'DELETE INVOICE ERROR:',
      error,
    );

    throw error;
  }
};