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
  inputsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: Colors.blueColorMode,
  },
  saveButtonText: {
    color: Colors.white,
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
    color: Colors.blueColorMode,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.blueColorMode,
    marginTop: 10,
  },
  errorMessageContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorMessageText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default styles;

