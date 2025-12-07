import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed button
  },
  spacer: {
    height: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandPurpleDeep,
    textAlign: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: Colors.white,
  },
  handleIndicator: {
    backgroundColor: '#D0D0D0',
    width: 40,
    height: 4,
  },
});

export default styles;

