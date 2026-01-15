import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  // Bell icon and title section
  iconTitleContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    gap: 16,
  },
  notificationsTitle: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#1D0A74',
    letterSpacing: 1,
  },
  // Push notifications toggle section
  pushNotificationsSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  pushNotificationsLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#1D0A74',
    borderRadius: 4,
    overflow: 'hidden',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: Colors.white,
  },
  toggleButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: '#1D0A74',
  },
  toggleButtonRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#1D0A74',
  },
  toggleButtonActive: {
    backgroundColor: '#1D0A74',
  },
  toggleButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#1D0A74',
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  // Notifications list
  notificationsListContainer: {
    backgroundColor: Colors.white,
  },
  // Previously seen section
  previouslySeenTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#1D0A74',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  // Empty state
  emptyStateContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default styles;

