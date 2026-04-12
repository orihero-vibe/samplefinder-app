import { StyleSheet } from 'react-native';
import { AUTH_WHITE_CONTENT_TOP_PADDING } from '@/constants/authLayout';
import { Colors } from '@/constants';

const styles = StyleSheet.create({
  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  wrapperContent: {
    paddingVertical: 0,
    paddingHorizontal: 30,
    paddingTop: AUTH_WHITE_CONTENT_TOP_PADDING,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
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
    marginBottom: 16,
    lineHeight: 24,
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 24,
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
    marginBottom: 2,
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
  didntGetCodeContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  didntGetCodeTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: 8,
  },
  didntGetCodeText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  resendButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2D1B69',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonDisabled: {
    borderColor: '#CCC',
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needHelpContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  needHelpText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#999',
    textAlign: 'center',
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

