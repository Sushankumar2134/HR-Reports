import React, {
	useEffect,
	useMemo,
	useState
} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text} from '../../components';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
	getOrganizationSubscriptions,
    updateOrganizationSubscription,
	deleteOrganizationSubscription,
    createOrganizationSubscription,
    getOrganizations,
	getPlansDropdown,
} from '../../api/SubscriptionAPI';

const PRIMARY_DARK_PINK = '#C2188B';

type ScreenMode = 'list' | 'assign';

type StatusType = 'Trial' | 'Active' | 'Grace' | 'Suspended' | 'Expired';

interface OrganizationSubscriptionRow {
  id: string;
  organization: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  status: StatusType;
  autoRenew: boolean;
}

const STATUS_OPTIONS: StatusType[] = [
  'Trial',
  'Active',
  'Grace',
  'Suspended',
  'Expired',
];




const OrganizationSubscriptions = () => {
    const [orgOptions, setOrgOptions] = useState<any[]>([]);

const [planOptions, setPlanOptions] = useState<any[]>([]);
    const [rows, setRows] = useState<OrganizationSubscriptionRow[]>([]);
  const {width} = useWindowDimensions();
  const isMobile = width < 768;
  const [mode, setMode] = useState<ScreenMode>('list');
  const [editingRow, setEditingRow] = useState<OrganizationSubscriptionRow | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
 const [form, setForm] = useState({
  organization: '',
  organization_id: '',

  plan: '',
  plan_id: '',

  startDate: '',
  expiryDate: '',

  status: 'Trial' as StatusType,

  autoRenew: false,
});
useEffect(() => {

	loadSubscriptions();

}, []);

const loadSubscriptions = async () => {

	const data = await getOrganizationSubscriptions();

	const orgs = await getOrganizations();

	const plans = await getPlansDropdown();

	console.log('SCREEN DATA:', data);

	setRows(data as OrganizationSubscriptionRow[]);

	setOrgOptions(orgs);

	setPlanOptions(plans);
};
  const title = useMemo(() => {
    if (mode === 'assign') {
      return 'Assign Subscription';
    }

    return 'Organization Subscriptions';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'assign') {
      return 'Assign subscription plans to organizations';
    }

    return 'Manage organization subscription assignments';
  }, [mode]);

  const handleAssignClick = () => {
    setEditingRow(null);
 setForm({
  organization: '',
  organization_id: '',

  plan: '',
  plan_id: '',

  startDate: '',
  expiryDate: '',

  status: 'Trial',

  autoRenew: false,
});
    setMode('assign');
    setShowOrgDropdown(false);
    setShowPlanDropdown(false);
    setShowStatusDropdown(false);
    setStartDate(new Date());
    setExpiryDate(new Date());
  };

  const handleEdit = (row: OrganizationSubscriptionRow) => {
    const parsedStart = new Date(row.startDate);
    const parsedExpiry = new Date(row.expiryDate);
    setEditingRow(row);
   const selectedOrg = orgOptions.find(
  (org) => org.name === row.organization
);

const selectedPlan = planOptions.find(
  (plan) => plan.name === row.plan
);

setForm({
  organization: row.organization,
  organization_id: selectedOrg?.id ?? '',

  plan: row.plan,
  plan_id: selectedPlan?.id ?? '',

  startDate: row.startDate,
  expiryDate: row.expiryDate,

  status: row.status,

  autoRenew: row.autoRenew,
});
    if (!Number.isNaN(parsedStart.getTime())) {
      setStartDate(parsedStart);
    }
    if (!Number.isNaN(parsedExpiry.getTime())) {
      setExpiryDate(parsedExpiry);
    }
    setMode('assign');
    setShowOrgDropdown(false);
    setShowPlanDropdown(false);
    setShowStatusDropdown(false);
  };

  const handleDelete = (
	row: OrganizationSubscriptionRow,
) => {

	Alert.alert(
		'Delete Assignment',
		`Delete subscription for ${row.organization}?`,
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

						await deleteOrganizationSubscription(
							row.id,
						);

						await loadSubscriptions();

						Alert.alert(
							'Success',
							'Subscription deleted successfully',
						);

					} catch {

						Alert.alert(
							'Error',
							'Failed to delete subscription',
						);
					}
				},
			},
		],
	);
};
const handleSubmit = async () => {

	try {

		if (editingRow) {

			await updateOrganizationSubscription(
				editingRow.id,
				form,
			);

			Alert.alert(
				'Success',
				'Subscription updated.',
			);

		} else {

			await createOrganizationSubscription(
				form,
			);

			Alert.alert(
				'Success',
				'Subscription assigned successfully.',
			);
		}

		await loadSubscriptions();

		setMode('list');

		setEditingRow(null);

		setForm({
			organization: '',
			organization_id: '',

			plan: '',
			plan_id: '',

			startDate: '',
			expiryDate: '',

			status: 'Trial',

			autoRenew: false,
		});

	} catch (error) {

		console.log(
			'SUBMIT ERROR:',
			error,
		);

		Alert.alert(
			'Error',
			'Operation failed',
		);
	}
};
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
        <View>
          <Text h4 semibold style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {mode === 'list' ? (
          <TouchableOpacity
            style={[styles.primaryButton, isMobile && styles.primaryButtonMobile]}
            onPress={handleAssignClick}>
            <Text semibold style={styles.primaryButtonText}>
              + ASSIGN SUBSCRIPTION
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
        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[styles.row, styles.header]}>
                <View style={styles.indexCell}>
                  <Text semibold style={styles.cell}>
                    #
                  </Text>
                </View>
                <View style={styles.organizationCell}>
                  <Text semibold style={styles.cell}>
                    Organization
                  </Text>
                </View>
                <View style={styles.planCell}>
                  <Text semibold style={styles.cell}>
                    Plan
                  </Text>
                </View>
                <View style={styles.dateCell}>
                  <Text semibold style={styles.cell}>
                    Start Date
                  </Text>
                </View>
                <View style={styles.dateCell}>
                  <Text semibold style={styles.cell}>
                    Expiry Date
                  </Text>
                </View>
                <View style={styles.statusCell}>
                  <Text semibold style={styles.cell}>
                    Status
                  </Text>
                </View>
                <View style={styles.autoRenewCell}>
                  <Text semibold style={styles.cell}>
                    Auto Renew
                  </Text>
                </View>
                <View style={styles.actionsCell}>
                  <Text semibold style={styles.cell}>
                    Actions
                  </Text>
                </View>
              </View>

              {rows.length === 0 ? (
                <View style={styles.row}>
                  <View style={styles.organizationCell}>
                    <Text style={styles.cell}>No subscriptions found</Text>
                  </View>
                </View>
              ) : (
              rows.map((row: OrganizationSubscriptionRow, index: number) => (
                  <View key={row.id} style={styles.row}>
                    <View style={styles.indexCell}>
                      <Text style={styles.cell}>{index + 1}</Text>
                    </View>
                    <View style={styles.organizationCell}>
                      <Text style={styles.cell}>{row.organization}</Text>
                    </View>
                    <View style={styles.planCell}>
                      <Text style={styles.cell}>{row.plan}</Text>
                    </View>
                    <View style={styles.dateCell}>
                      <Text style={styles.cell}>{row.startDate}</Text>
                    </View>
                    <View style={styles.dateCell}>
                      <Text style={styles.cell}>{row.expiryDate}</Text>
                    </View>
                    <View style={styles.statusCell}>
                      <Text style={styles.cell}>{row.status}</Text>
                    </View>
                    <View style={styles.autoRenewCell}>
                      <Text style={styles.cell}>{row.autoRenew ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.actionsCell}>
                      <View style={styles.actionIconsRow}>
                        <TouchableOpacity onPress={() => handleEdit(row)} style={styles.iconButton}>
                          <MaterialCommunityIcons
                            name="pencil"
                            size={18}
                            color={PRIMARY_DARK_PINK}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(row)}
                          style={styles.iconButton}>
                          <MaterialCommunityIcons
                            name="trash-can"
                            size={18}
                            color={PRIMARY_DARK_PINK}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.formLayout, isMobile && styles.mobileStack]}>
          <View style={styles.formCard}>
            <Text semibold style={styles.sectionTitle}>
              Subscription Details
            </Text>

            <View style={[styles.formRow, isMobile && styles.formRowStack]}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Organization</Text>
                <TouchableOpacity
                  style={styles.selectMock}
                  onPress={() => {
                    setShowOrgDropdown((prev) => !prev);
                    setShowPlanDropdown(false);
                    setShowStatusDropdown(false);
                  }}>
                  <Text style={styles.selectText}>{form.organization}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#667085" />
                </TouchableOpacity>
                {showOrgDropdown && (
                  <View style={styles.dropdownMenu}>
                    {orgOptions.map((org) => (
                      <TouchableOpacity
                    key={org.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setForm((prev) => ({
  ...prev,
 organization: org.name,
organization_id: org.id,
}));
                          setShowOrgDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{org.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Subscription Plan</Text>
                <TouchableOpacity
                  style={styles.selectMock}
                  onPress={() => {
                    setShowPlanDropdown((prev) => !prev);
                    setShowOrgDropdown(false);
                    setShowStatusDropdown(false);
                  }}>
                  <Text style={styles.selectText}>{form.plan}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#667085" />
                </TouchableOpacity>
                {showPlanDropdown && (
                  <View style={styles.dropdownMenu}>
                    {planOptions.map((plan) => (
                      <TouchableOpacity
                       key={plan.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setForm((prev) => ({
  ...prev,
 plan: plan.name,
plan_id: plan.id,
}));
                          setShowPlanDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{plan.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.formRow, isMobile && styles.formRowStack]}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Start Date</Text>
                <TouchableOpacity style={styles.inputMock} onPress={() => setStartDateOpen(true)}>
                  <Text style={styles.selectText}>{form.startDate || 'yyyy-mm-dd'}</Text>
                  <MaterialCommunityIcons name="calendar" size={18} color="#667085" />
                </TouchableOpacity>

                {startDateOpen && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS !== 'ios') {
                        setStartDateOpen(false);
                      }

                      if (selectedDate) {
                        setStartDate(selectedDate);
                        setForm((prev) => ({
                          ...prev,
                          startDate: selectedDate.toISOString().split('T')[0],
                        }));
                      }

                      if (event.type === 'dismissed') {
                        setStartDateOpen(false);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <TouchableOpacity style={styles.inputMock} onPress={() => setExpiryDateOpen(true)}>
                  <Text style={styles.selectText}>{form.expiryDate || 'yyyy-mm-dd'}</Text>
                  <MaterialCommunityIcons name="calendar" size={18} color="#667085" />
                </TouchableOpacity>

                {expiryDateOpen && (
                  <DateTimePicker
                    value={expiryDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS !== 'ios') {
                        setExpiryDateOpen(false);
                      }

                      if (selectedDate) {
                        setExpiryDate(selectedDate);
                        setForm((prev) => ({
                          ...prev,
                          expiryDate: selectedDate.toISOString().split('T')[0],
                        }));
                      }

                      if (event.type === 'dismissed') {
                        setExpiryDateOpen(false);
                      }
                    }}
                  />
                )}
              </View>
            </View>

            <View style={[styles.formRow, isMobile && styles.formRowStack]}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Status</Text>
                <TouchableOpacity
                  style={styles.selectMock}
                  onPress={() => {
                    setShowStatusDropdown((prev) => !prev);
                    setShowOrgDropdown(false);
                    setShowPlanDropdown(false);
                  }}>
                  <Text style={styles.selectText}>{form.status}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#667085" />
                </TouchableOpacity>
                {showStatusDropdown && (
                  <View style={styles.dropdownMenu}>
                    {STATUS_OPTIONS.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setForm((prev) => ({...prev, status}));
                          setShowStatusDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Auto Renew</Text>
                <View style={styles.autoRenewRow}>
                  <Switch
                    value={form.autoRenew}
                    onValueChange={(value) => setForm((prev) => ({...prev, autoRenew: value}))}
                  />
                  <Text style={styles.autoRenewLabel}>Enable Auto Renewal</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.infoCard, isMobile && styles.mobileCardSpacing]}>
            <Text semibold style={styles.sectionTitle}>
              Information
            </Text>

            <Text style={styles.infoHeading}>Status Types:</Text>
            {STATUS_OPTIONS.map((status) => (
              <Text key={status} style={styles.infoText}>
                • {status} - {status === 'Trial'
                  ? 'Free trial access'
                  : status === 'Active'
                  ? 'Paid active subscription'
                  : status === 'Grace'
                  ? 'Payment overdue'
                  : status === 'Suspended'
                  ? 'Access restricted'
                  : 'Subscription ended'}
              </Text>
            ))}

            <TouchableOpacity style={styles.assignButton} onPress={handleSubmit}>
              <Text semibold style={styles.assignButtonText}>
                ASSIGN SUBSCRIPTION
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default OrganizationSubscriptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
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
  title: {
    color: '#1C2746',
  },
  subtitle: {
    color: '#667085',
    marginTop: 4,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: PRIMARY_DARK_PINK,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  primaryButtonMobile: {
    width: '100%',
    minWidth: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
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
  backButtonText: {
    color: '#344054',
    fontSize: 11,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
  },
  header: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#334155',
  },
  indexCell: {
    width: 60,
  },
  organizationCell: {
    width: 180,
  },
  planCell: {
    width: 140,
  },
  dateCell: {
    width: 120,
  },
  statusCell: {
    width: 110,
  },
  autoRenewCell: {
    width: 120,
  },
  actionsCell: {
    width: 120,
  },
  narrowCell: {
    width: 140,
  },
  wideCell: {
    width: 220,
  },
  iconButton: {
    padding: 6,
  },
  formLayout: {
    flexDirection: 'row',
    gap: 14,
  },
  formCard: {
    flex: 1.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    padding: 16,
  },
  infoCard: {
    flex: 0.8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    padding: 16,
  },
  sectionTitle: {
    color: '#1C2746',
    marginBottom: 18,
  },
  formRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  fieldBlock: {
    flex: 1,
  },
  fieldLabel: {
    color: '#344054',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  selectMock: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputMock: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    color: '#667085',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
  },
  dropdownItemText: {
    color: '#344054',
    fontSize: 13,
  },
  autoRenewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  autoRenewLabel: {
    marginLeft: 8,
    color: '#344054',
  },
  infoHeading: {
    color: '#344054',
    marginBottom: 10,
    fontWeight: '600',
  },
  infoText: {
    color: '#667085',
    marginBottom: 6,
    fontSize: 12,
  },
  assignButton: {
    marginTop: 24,
    backgroundColor: PRIMARY_DARK_PINK,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 10,
  },
  mobileStack: {
    flexDirection: 'column',
  },
  formRowStack: {
    flexDirection: 'column',
    gap: 0,
  },
  mobileCardSpacing: {
    marginTop: 14,
  },
});
