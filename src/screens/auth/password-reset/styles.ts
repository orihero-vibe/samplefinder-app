import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapperContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  requirementsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#999',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  confirmPasswordInput: {
    marginTop: 16,
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  resendContainer: {
    marginTop: 8,
  },
  resendText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#999',
    textAlign: 'center',
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resendLoadingText: {
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;

