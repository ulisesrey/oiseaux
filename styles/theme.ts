import { StyleSheet } from 'react-native';

// 1. Define the Color Palette (The "Ingredients")
export const colors = {
  // Brand & Accents
  primary: '#007AFF',      // Standard iOS Blue
  success: '#4CD964',      // Green for correct answers
  error: '#FF3B30',        // Red for wrong answers
  
  // Duolingo-style Path Colors (Ready to be imported into index.tsx!)
  duoGreen: '#58CC02',
  duoGreenDark: '#4BAA00',
  gold: '#FFD700',
  goldDark: '#E5C100',
  heartRed: '#FF4B4B',
  locked: '#E5E5E5',
  lockedDark: '#CECECE',

  // Backgrounds
  background: '#F5F7FA',   // Main app background
  surface: '#ffffff',      // Cards, buttons, containers
  
  // Grays & Borders
  grayLighter: '#F0F2F5',
  grayLight: '#E1E4E8',
  border: '#DDDDDD',
  shadow: '#000000',

  // Typography
  textDark: '#1A1A1A',     // Headers, main words
  textMain: '#333333',     // Titles
  textSecondary: '#666666',// Subtitles, badges
  textMuted: '#999999',    // Small text, counters
  textWhite: '#ffffff',
};

// 2. Use the colors in your Global Theme (The "Tupperware")
export const theme = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  levelTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    position: 'absolute', 
    top: 70, 
    color: colors.textMain 
  },
  wordContainer: { 
    backgroundColor: colors.surface, 
    padding: 40, 
    borderRadius: 30, 
    marginBottom: 50,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10 
  },
  wordText: { fontSize: 56, color: colors.textDark },
  underlined: { 
    textDecorationLine: 'underline', 
    color: colors.primary, 
    fontWeight: 'bold' 
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { 
    backgroundColor: colors.surface, 
    padding: 20, 
    margin: 10, 
    borderRadius: 20, 
    minWidth: 100, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  btnSuccess: { backgroundColor: colors.success, borderColor: colors.success },
  btnError: { backgroundColor: colors.error, borderColor: colors.error },
  btnText: { fontSize: 32, fontWeight: '500' },
  whiteText: { color: colors.textWhite },
  footer: { position: 'absolute', bottom: 40, width: '100%' },
  tabContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  smallBtn: { padding: 8, margin: 4, backgroundColor: colors.grayLight, borderRadius: 10 },
  smallBtnText: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary },
  activeLevel: { backgroundColor: colors.primary },

  menuTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 60, 
    marginBottom: 20, 
    color: colors.textDark,
    textAlign: 'center'
  },
  menuGrid: { width: '100%', paddingHorizontal: 10 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardId: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.textMain },
  soundBadgeContainer: { flexDirection: 'row', marginTop: 10 },
  soundBadge: { 
    backgroundColor: colors.grayLighter, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginRight: 8,
    fontSize: 14,
    color: colors.textSecondary
  },
  backButton: { position: 'absolute', top: 60, left: 20, padding: 10 },
  backButtonText: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  gameLevelTitle: { fontSize: 20, fontWeight: '600', position: 'absolute', top: 110, color: colors.textSecondary },
  
  successEmoji: { fontSize: 80, marginBottom: 20 },
  successSubtitle: { 
    fontSize: 18, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: 40,
    paddingHorizontal: 30 
  },
  counterText: {
    position: 'absolute',
    top: 140,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'bold'
  }
});