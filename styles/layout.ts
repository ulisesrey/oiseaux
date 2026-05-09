import { StyleSheet } from 'react-native';
import { colors } from './theme'; // <-- Bring in the single source of truth!

export const layoutStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.locked, // Was #E5E5E5
    gap: 20,
  },
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
    backgroundColor: colors.grayLighter, // Was #F7F7F7
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.locked, // Was #E5E5E5
  },
  starBg: {
    backgroundColor: colors.textDark, // Was #2D2D2D. textDark is a great fit for a dark pill background
    borderColor: colors.shadow,       // Was #000
  },
  statText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.textMain, // Was #333
  },
  whiteText: {
    color: colors.textWhite, // Was #fff
  },
  progressTrack: {
    flex: 1,
    height: 14,
    backgroundColor: colors.locked, // Was #E5E5E5
    borderRadius: 7,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.duoGreen, // Was #58CC02
    borderRadius: 7,
  }
});