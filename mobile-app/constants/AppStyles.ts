import { StyleSheet } from 'react-native';

export const AppColors = {
  backgroundDark: '#0a0a0a',
  surfaceDark: '#121212',
  surfaceGlass: 'rgba(25, 25, 25, 0.7)',
  primaryOrange: '#ff8a00',
  primaryNeonBlue: '#00d1ff',
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
  
  // Glassmorphism Components
  glassCard: {
    backgroundColor: AppColors.surfaceGlass,
    borderColor: AppColors.borderGlass,
    borderWidth: 1,
    borderRadius: 24,
    // Add shadow (pseudo-glass)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  
  // Interactive Elements
  glowBtnOrange: {
    backgroundColor: AppColors.primaryOrange,
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBtnOrangeText: {
    color: AppColors.textBlack,
    fontWeight: 'bold',
  },
  
  glowBtnBlue: {
    backgroundColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBtnBlueText: {
    color: AppColors.textBlack,
    fontWeight: 'bold',
  },
  
  // High-Contrast Input System
  highContrastInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    color: AppColors.textWhite,
    borderRadius: 12,
    padding: 12,
  },
  
  // Utilities
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
});
