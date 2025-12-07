import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#2D1B69',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    marginLeft: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpPrompt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    marginBottom: 12,
  },
});

export default styles;

