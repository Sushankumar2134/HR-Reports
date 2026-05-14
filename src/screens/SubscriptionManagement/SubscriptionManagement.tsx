import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {Text} from '../../components';
import Plans from './Plans';
import OrganizationSubscriptions from './OrganizationSubscriptions';
import UsageMonitoring from './UsageMonitoring';
import SubscriptionInvoices from './SubscriptionInvoices';
// import SubscriptionInvoices from './SubscriptionInvoices';

type MenuKey =
  | 'plans'
  | 'organizationSubscriptions'
  | 'usageMonitoring'
  | 'subscriptionInvoices';

const PRIMARY_DARK_PINK = '#C2188B';

const SubscriptionManagement = () => {
  const route = useRoute<any>();
  const activeMenu: MenuKey = route?.params?.menuKey || 'plans';

  const ActiveScreen = useMemo(() => {
    if (activeMenu === 'organizationSubscriptions') {
      return <OrganizationSubscriptions />;
    }

    if (activeMenu === 'usageMonitoring') {
      return <UsageMonitoring />;
    }

    if (activeMenu === 'subscriptionInvoices') {
      return <SubscriptionInvoices />;
    }

    return <Plans />;
  }, [activeMenu]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {ActiveScreen}
      </ScrollView>
    </View>
  );
};

export default SubscriptionManagement;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2F7',
    padding: 14,
  },
  contentArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 30,
  },
});
