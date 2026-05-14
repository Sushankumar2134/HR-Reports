import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text} from '../../components';
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlans,
  SubscriptionPlan,
  SubscriptionPlanPayload,
  updateSubscriptionPlan,
} from '../../api/SubscriptionAPI';

const PRIMARY_DARK_PINK = '#C2188B';

type FormMode = 'list' | 'create' | 'edit';

interface PlanFormState {
  planName: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  trialDays: string;
  graceDays: string;
  maxUsers: string;
  maxPatients: string;
  maxHospitals: string;
  storageLimitMb: string;
  status: 'Active' | 'Inactive';
  modules: string[];
}

const MODULE_OPTIONS = [
  'Dashboard',
  'Access Control',
  'Users',
  'Roles & Permissions',
  'Organization',
  'Hospitals',
  'Institutions',
  'Departments',
  'Staff Management',
  'Patient Management',
  'Inventory',
  'Pharmacy',
  'Leave Management',
];

const createInitialFormState = (): PlanFormState => ({
  planName: '',
  slug: '',
  description: '',
  monthlyPrice: '',
  yearlyPrice: '',
  trialDays: '0',
  graceDays: '0',
  maxUsers: '',
  maxPatients: '',
  maxHospitals: '',
  storageLimitMb: '',
  status: 'Active',
  modules: [],
});

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const numberOrZero = (value: string): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const mapPlanToForm = (plan: SubscriptionPlan): PlanFormState => ({
  planName: plan.planName,
  slug: plan.slug,
  description: plan.description,
  monthlyPrice: String(plan.monthlyPrice),
  yearlyPrice: String(plan.yearlyPrice),
  trialDays: String(plan.trialDays),
  graceDays: String(plan.graceDays),
  maxUsers: String(plan.maxUsers),
  maxPatients: String(plan.maxPatients),
  maxHospitals: String(plan.maxHospitals),
  storageLimitMb: String(plan.storageLimitMb),
  status: plan.status,
  modules: plan.modules,
});

const Plans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<FormMode>('list');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormState>(createInitialFormState());

  const loadPlans = useCallback(async () => {
  try {
    setLoading(true);

    const data = await getSubscriptionPlans();

    console.log('PLANS DATA:', data);

    setPlans(data);
  } catch (error) {
    console.log('Failed to fetch subscription plans', error);
    Alert.alert('Error', 'Unable to load subscription plans.');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const title = useMemo(() => {
    if (mode === 'edit') {
      return 'Edit Subscription Plan';
    }

    if (mode === 'create') {
      return 'Create Subscription Plan';
    }

    return 'Subscription Plans';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'list') {
      return 'Manage SaaS subscription plans';
    }

    return 'Configure pricing, limits and modules';
  }, [mode]);

  const handleCreate = () => {
    setEditingPlanId(null);
    setForm(createInitialFormState());
    setMode('create');
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setForm(mapPlanToForm(plan));
    setMode('edit');
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    Alert.alert('Delete Plan', `Delete ${plan.planName}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscriptionPlan(plan.id);
            await loadPlans();
          } catch (error) {
            console.log('Delete subscription plan failed', error);
            Alert.alert('Error', 'Unable to delete plan.');
          }
        },
      },
    ]);
  };

  const setField = (key: keyof PlanFormState, value: string | string[]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleModule = (moduleName: string) => {
    setForm((prev) => {
      const exists = prev.modules.includes(moduleName);

      if (exists) {
        return {
          ...prev,
          modules: prev.modules.filter((item) => item !== moduleName),
        };
      }

      return {
        ...prev,
        modules: [...prev.modules, moduleName],
      };
    });
  };

  const buildPayload = (): SubscriptionPlanPayload => ({
    planName: form.planName.trim(),
    slug: form.slug.trim() || toSlug(form.planName),
    description: form.description.trim(),
    monthlyPrice: numberOrZero(form.monthlyPrice),
    yearlyPrice: numberOrZero(form.yearlyPrice),
    trialDays: numberOrZero(form.trialDays),
    graceDays: numberOrZero(form.graceDays),
    maxUsers: numberOrZero(form.maxUsers),
    maxPatients: numberOrZero(form.maxPatients),
    maxHospitals: numberOrZero(form.maxHospitals),
    storageLimitMb: numberOrZero(form.storageLimitMb),
    status: form.status,
    modules: form.modules,
  });

  const handleSave = async () => {
    if (!form.planName.trim()) {
      Alert.alert('Validation', 'Plan Name is required.');
      return;
    }

    if (!form.monthlyPrice.trim() || !form.yearlyPrice.trim()) {
      Alert.alert('Validation', 'Monthly Price and Yearly Price are required.');
      return;
    }

    try {
      const payload = buildPayload();

      if (mode === 'edit' && editingPlanId) {
        await updateSubscriptionPlan(editingPlanId, payload);
      } else {
        await createSubscriptionPlan(payload);
      }

      await loadPlans();
      setMode('list');
      setEditingPlanId(null);
      setForm(createInitialFormState());
    } catch (error) {
      console.log('Save subscription plan failed', error);
      Alert.alert('Error', 'Unable to save plan.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text h4 semibold style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {mode === 'list' ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
            <Text semibold style={styles.primaryButtonText}>
              + CREATE PLAN
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('list')}>
            <Text semibold style={styles.secondaryButtonText}>
              BACK TO LIST
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {mode === 'list' ? (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.indexCell}>
                  <Text semibold style={styles.headerCell}>
                    #
                  </Text>
                </View>
                <View style={styles.planCell}>
                  <Text semibold style={styles.headerCell}>
                    PLAN NAME
                  </Text>
                </View>
                <View style={styles.priceCell}>
                  <Text semibold style={styles.headerCell}>
                    MONTHLY PRICE
                  </Text>
                </View>
                <View style={styles.priceCell}>
                  <Text semibold style={styles.headerCell}>
                    YEARLY PRICE
                  </Text>
                </View>
                <View style={styles.limitCell}>
                  <Text semibold style={styles.headerCell}>
                    USERS LIMIT
                  </Text>
                </View>
                <View style={styles.limitCell}>
                  <Text semibold style={styles.headerCell}>
                    PATIENTS LIMIT
                  </Text>
                </View>
                <View style={styles.limitCell}>
                  <Text semibold style={styles.headerCell}>
                    HOSPITALS LIMIT
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

              {loading ? (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyText}>Loading plans...</Text>
                </View>
              ) : plans.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyText}>No plans found</Text>
                </View>
              ) : (
                plans.map((plan, index) => (
                  <View key={plan.id} style={styles.tableRow}>
                    <View style={styles.indexCell}>
                      <Text style={styles.cell}>{index + 1}</Text>
                    </View>
                    <View style={styles.planCell}>
                      <Text style={styles.cell}>{plan.planName}</Text>
                    </View>
                    <View style={styles.priceCell}>
                      <Text style={styles.cell}>{plan.monthlyPrice}</Text>
                    </View>
                    <View style={styles.priceCell}>
                      <Text style={styles.cell}>{plan.yearlyPrice}</Text>
                    </View>
                    <View style={styles.limitCell}>
                      <Text style={styles.cell}>{plan.maxUsers}</Text>
                    </View>
                    <View style={styles.limitCell}>
                      <Text style={styles.cell}>{plan.maxPatients}</Text>
                    </View>
                    <View style={styles.limitCell}>
                      <Text style={styles.cell}>{plan.maxHospitals}</Text>
                    </View>
                    <View style={[styles.statusCell, styles.statusWrapper]}>
                      <Text
                        style={{
                          ...styles.statusPill,
                          ...(plan.status === 'Active'
                            ? styles.activePill
                            : styles.inactivePill),
                        }}>
                        {plan.status}
                      </Text>
                    </View>
                    <View style={[styles.actionCell, styles.actionRow]}>
                      <TouchableOpacity onPress={() => handleEdit(plan)} style={styles.iconButton}>
                        <MaterialCommunityIcons
                          name="pencil"
                          size={18}
                          color={PRIMARY_DARK_PINK}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(plan)}
                        style={styles.iconButton}>
                        <MaterialCommunityIcons
                          name="trash-can"
                          size={18}
                          color={PRIMARY_DARK_PINK}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
          <View style={styles.sectionCard}>
            <Text semibold style={styles.sectionTitle}>
              Basic Information
            </Text>
            <View style={styles.rowWrap}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Plan Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.planName}
                  onChangeText={(value) => {
                    setField('planName', value);
                    if (!form.slug.trim()) {
                      setField('slug', toSlug(value));
                    }
                  }}
                  placeholder="Enter plan name"
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Slug</Text>
                <TextInput
                  style={styles.input}
                  value={form.slug}
                  onChangeText={(value) => setField('slug', toSlug(value))}
                  placeholder="plan-slug"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.singleBlock}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={(value) => setField('description', value)}
                placeholder="Describe this subscription plan"
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text semibold style={styles.sectionTitle}>
              Pricing Configuration
            </Text>
            <View style={styles.rowWrap}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Monthly Price</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.monthlyPrice}
                  onChangeText={(value) => setField('monthlyPrice', value)}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Yearly Price</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.yearlyPrice}
                  onChangeText={(value) => setField('yearlyPrice', value)}
                />
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Trial Days</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.trialDays}
                  onChangeText={(value) => setField('trialDays', value)}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Grace Days</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.graceDays}
                  onChangeText={(value) => setField('graceDays', value)}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text semibold style={styles.sectionTitle}>
              Usage Limits
            </Text>
            <View style={styles.rowWrap}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Max Users</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.maxUsers}
                  onChangeText={(value) => setField('maxUsers', value)}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Max Patients</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.maxPatients}
                  onChangeText={(value) => setField('maxPatients', value)}
                />
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Max Hospitals</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.maxHospitals}
                  onChangeText={(value) => setField('maxHospitals', value)}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Storage Limit (MB)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.storageLimitMb}
                  onChangeText={(value) => setField('storageLimitMb', value)}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text semibold style={styles.sectionTitle}>
              Plan Modules
            </Text>

            <View style={styles.modulesWrapper}>
              {MODULE_OPTIONS.map((moduleName) => {
                const checked = form.modules.includes(moduleName);

                return (
                  <TouchableOpacity
                    key={moduleName}
                    style={styles.moduleRow}
                    onPress={() => toggleModule(moduleName)}>
                    <MaterialCommunityIcons
                      name={checked ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                      size={20}
                      color={checked ? PRIMARY_DARK_PINK : '#98A2B3'}
                    />
                    <Text style={styles.moduleText}>{moduleName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={16}
              color="#FFFFFF"
              style={styles.saveIcon}
            />
            <Text semibold style={styles.saveButtonText}>
              SAVE PLAN
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default Plans;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#1F2A44',
  },
  subtitle: {
    color: '#667085',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: PRIMARY_DARK_PINK,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  secondaryButton: {
    borderColor: PRIMARY_DARK_PINK,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: PRIMARY_DARK_PINK,
    fontSize: 11,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
    minHeight: 52,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F8FAFC',
  },
  headerCell: {
    color: '#334155',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  cell: {
    color: '#334155',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  indexCell: {
    width: 45,
  },
  planCell: {
    width: 180,
  },
  priceCell: {
    width: 140,
  },
  limitCell: {
    width: 130,
  },
  statusCell: {
    width: 120,
  },
  actionCell: {
    width: 120,
  },
  statusWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  statusPill: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activePill: {
    backgroundColor: '#12B76A',
  },
  inactivePill: {
    backgroundColor: '#667085',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  iconButton: {
    padding: 6,
  },
  emptyRow: {
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 30,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    padding: 14,
  },
  sectionTitle: {
    color: '#1F2A44',
    marginBottom: 14,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputBlock: {
    flex: 1,
    minWidth: 220,
    marginBottom: 12,
  },
  singleBlock: {
    width: '100%',
  },
  label: {
    color: '#344054',
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    color: '#1D2939',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modulesWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#F1F3F7',
    paddingTop: 8,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  moduleText: {
    marginLeft: 8,
    color: '#475467',
  },
  saveButton: {
    backgroundColor: PRIMARY_DARK_PINK,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  saveIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});
