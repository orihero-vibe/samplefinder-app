import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
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
    marginTop: 8,
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

