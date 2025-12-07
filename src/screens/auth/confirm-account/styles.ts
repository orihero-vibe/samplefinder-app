import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapperContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
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
});

export default styles;

