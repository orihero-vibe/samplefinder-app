import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 30,
    paddingVertical: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  nameInput: {
    flex: 1,
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
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
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
  },
  signInLink: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  termsText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLinkText: {
    textDecorationLine: 'underline',
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
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    textDecorationLine: 'underline',
  },
});

export default styles;

