import { StyleSheet } from 'react-native';
import { AUTH_WHITE_CONTENT_TOP_PADDING } from '@/constants/authLayout';

const styles = StyleSheet.create({
  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  screenContent: {
    paddingVertical: 0,
    paddingHorizontal: 30,
    paddingTop: AUTH_WHITE_CONTENT_TOP_PADDING,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 40,
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default styles;

