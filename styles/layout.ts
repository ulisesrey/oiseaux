import { StyleSheet } from 'react-native';

export const layoutStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
    gap: 20,
  },
  // NEW: Added for the Game Screen HUD
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 50,
    zIndex: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  starBg: {
    backgroundColor: '#2D2D2D', 
    borderColor: '#000',
  },
  statText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  whiteText: {
    color: '#fff',
  },
  // NEW: Added for the Progress Bar
  progressTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 7,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: 7,
  }
});