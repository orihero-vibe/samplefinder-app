import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 30,
    paddingVertical: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInPrompt: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
  },
  signInLink: {
    color: '#2D1B69',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  termsText: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  legalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  legalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  legalButtonText: {
    color: '#2D1B69',
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    textDecorationLine: 'underline',
  },
});

export default styles;

