import { Colors } from '@/constants';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
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
    marginTop: 20,
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
    color: Colors.grayText,
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
  },
  signInLink: {
    color: Colors.grayText,
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  termsText: {
    color: Colors.grayText,
    fontSize: 12,
    fontFamily: 'Quicksand_300Light',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLinkText: {
    textDecorationLine: 'underline',
    fontFamily: 'Quicksand_500Medium',
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
  zipCodeContainer: {
    marginTop: 12,
  },
});

export default styles;

