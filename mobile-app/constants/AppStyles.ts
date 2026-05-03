import { StyleSheet, Platform } from 'react-native';

export const AppColors = {
  backgroundDark: '#0a0a0a',
  surfaceDark: '#121212',
  surfaceGlass: 'rgba(25, 25, 25, 0.7)',
  surfaceGlassLight: 'rgba(255, 255, 255, 0.05)',
  primaryOrange: '#ff8a00',
  secondaryOrange: '#ffb347',
  primaryNeonBlue: '#00d1ff',
  secondaryBlue: '#3b82f6',
  primaryBioGreen: '#13ec5b',
  accentBlue: '#3b82f6',
  textWhite: '#ffffff',
  textGray: '#a1a1aa',
  textBlack: '#000000',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  glowOrange: 'rgba(255, 138, 0, 0.3)',
  glowBlue: 'rgba(0, 209, 255, 0.3)',
};

export const AppStyles = StyleSheet.create({
  // Base Styles
  body: {
    flex: 1,
    backgroundColor: AppColors.backgroundDark,
  },
  textWhite: {
    color: AppColors.textWhite,
  },
  textGray: {
    color: AppColors.textGray,
  },
  
  // Premium Glassmorphism Cards
  glassCard: {
    backgroundColor: AppColors.surfaceGlass,
    borderColor: AppColors.borderGlass,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  
  glassCardInteractive: { // Simulates .glass-card-interactive
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderColor: AppColors.borderGlass,
    borderWidth: 1,
    borderRadius: 24,
  },

  // Interactive Buttons
  glowBtnOrange: {
    backgroundColor: AppColors.primaryOrange,
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBtnOrangeText: {
    color: AppColors.textBlack,
    fontWeight: '900',
    letterSpacing: 1,
  },
  
  glowBtnBlue: {
    backgroundColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBtnBlueText: {
    color: AppColors.textBlack,
    fontWeight: '900',
    letterSpacing: 1,
  },
  
  // High-Contrast Input System
  highContrastInput: {
    backgroundColor: AppColors.surfaceGlassLight,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    color: AppColors.textWhite,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  highContrastInputFocus: {
    backgroundColor: AppColors.textWhite,
    borderColor: AppColors.primaryOrange,
    color: AppColors.textBlack,
    shadowColor: AppColors.textWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },

  // AI & Cybernetic Accents
  insightChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  // Layout Utilities
  fullWidth: {
    width: '100%',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAtStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
