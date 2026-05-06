import { StyleSheet } from 'react-native';

export const theme = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  levelTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    position: 'absolute', 
    top: 70, 
    color: '#333' 
  },
  wordContainer: { 
    backgroundColor: '#fff', 
    padding: 40, 
    borderRadius: 30, 
    marginBottom: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10 
  },
  wordText: { fontSize: 56, color: '#1A1A1A' },
  underlined: { 
    textDecorationLine: 'underline', 
    color: '#007AFF', 
    fontWeight: 'bold' 
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { 
    backgroundColor: '#fff', 
    padding: 20, 
    margin: 10, 
    borderRadius: 20, 
    minWidth: 100, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#DDD' 
  },
  btnSuccess: { backgroundColor: '#4CD964', borderColor: '#4CD964' },
  btnError: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  btnText: { fontSize: 32, fontWeight: '500' },
  whiteText: { color: '#fff' },
  footer: { position: 'absolute', bottom: 40, width: '100%' },
  tabContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  smallBtn: { padding: 8, margin: 4, backgroundColor: '#E1E4E8', borderRadius: 10 },
  smallBtnText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  activeLevel: { backgroundColor: '#007AFF' }
});