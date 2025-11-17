import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/theme';

interface TaskBarItem {
  label: string;
  icon: any;
  route: '/Applicant/Dashboard' | '/Applicant/JobApplication' | '/Applicant/Candidateapply';
  badge: number;
}

export default function ApplicantTaskBar() {
  const router = useRouter();
  const pathname = usePathname();

  const taskBarItems: TaskBarItem[] = [
    {
      label: 'Dashboard',
      icon: 'view-dashboard',
      route: '/Applicant/Dashboard',
      badge: 0,
    },
    {
      label: 'Tin tuyển dụng',
      icon: 'briefcase-multiple',
      route: '/Applicant/JobApplication',
      badge: 0,
    },
    {
      label: 'Người ứng tuyển',
      icon: 'account-multiple',
      route: '/Applicant/Candidateapply',
      badge: 5,
    },
  ];

  const isActive = (route: string) => {
    return pathname.includes(route.split('/').pop() || '');
  };

  return (
    <View style={styles.container}>
      {taskBarItems.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.taskBarItem,
              active && styles.activeItem,
            ]}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={active ? colors.primary : '#999'}
              />
              {item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  taskBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeItem: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    marginTop: -8,
    paddingTop: 5,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
