import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Responsive sizing based on screen height
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

const styles = StyleSheet.create({
  title: {
    fontSize: isSmallDevice ? 22 : isMediumDevice ? 26 : 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 8 : 12,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : isMediumDevice ? 24 : 30,
    lineHeight: isSmallDevice ? 20 : 24,
    paddingHorizontal: isSmallDevice ? 10 : 0,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  errorContainer: {
    marginTop: isSmallDevice ? 8 : 12,
    marginBottom: isSmallDevice ? 4 : 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: isSmallDevice ? 12 : 14,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: isSmallDevice ? 4 : 8,
    marginBottom: isSmallDevice ? 12 : 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: isSmallDevice ? 20 : 24,
    height: isSmallDevice ? 20 : 24,
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
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Quicksand_500Medium',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Quicksand_500Medium',
    marginLeft: 4,
  },
  buttonContainer: {
    marginBottom: isSmallDevice ? 12 : 20,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpPrompt: {
    color: '#fff',
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Quicksand_500Medium',
    marginBottom: isSmallDevice ? 8 : 12,
  },
});

export default styles;

