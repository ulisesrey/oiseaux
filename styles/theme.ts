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
  activeLevel: { backgroundColor: '#007AFF' },

  // Add these to your existing theme.ts
  menuTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 60, // Give it space since the header is gone
    marginBottom: 20, 
    color: '#1A1A1A',
    textAlign: 'center'
  },
  menuGrid: { width: '100%', paddingHorizontal: 10 },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardId: { fontSize: 12, color: '#007AFF', fontWeight: 'bold', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  soundBadgeContainer: { flexDirection: 'row', marginTop: 10 },
  soundBadge: { 
    backgroundColor: '#F0F2F5', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginRight: 8,
    fontSize: 14,
    color: '#666'
  },
  backButton: { position: 'absolute', top: 60, left: 20, padding: 10 },
  backButtonText: { fontSize: 18, color: '#007AFF', fontWeight: '600' },
  gameLevelTitle: { fontSize: 20, fontWeight: '600', position: 'absolute', top: 110, color: '#666' },
  // Success emoji
  successEmoji: { fontSize: 80, marginBottom: 20 },
  successSubtitle: { 
    fontSize: 18, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 40,
    paddingHorizontal: 30 
  },
  counterText: {
    position: 'absolute',
    top: 140,
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold'
  }
});