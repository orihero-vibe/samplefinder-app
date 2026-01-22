import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandPurpleDeep,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  inProgressContainer: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.white,
    fontFamily: 'Quicksand_600SemiBold',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    gap: 8,
  },
  viewHistoryText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
  },
});

export default styles;

