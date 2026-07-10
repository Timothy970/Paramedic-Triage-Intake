export const COLORS = {
  background: '#121212', // Sleek dark mode background
  surface: '#1E1E1E',    // Dark card surface
  surfaceHover: '#2A2A2A',
  primary: '#378ADD',    // Premium blue
  primaryDisabled: '#555555',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  border: '#333333',
  borderActive: '#555555',
  error: '#FF3333',
  success: '#2E7D32',
  
  // Hazard color tokens
  priority: {
    1: { bg: '#B00020', text: '#FCEBEB', label: '1 - Critical/Life-Threatening' },
    2: { bg: '#E65100', text: '#FAECE7', label: '2 - Critical' },
    3: { bg: '#F9A825', text: '#412402', label: '3 - Urgent' },
    4: { bg: '#2E7D32', text: '#E6F1FB', label: '4 - Less Urgent' },
    5: { bg: '#1B5E20', text: '#EAF3DE', label: '5 - Routine' },
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const TYPOGRAPHY = {
  fontFamily: 'System',
  sizes: {
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
    input: 18,
  },
};

export const LAYOUT = {
  inputHeight: 58, // >= 56px for gloved/shaky thumbs
  buttonHeight: 64, // large primary touch target
  borderRadius: 12,
};

export const isCriticalPriority = (priority: number): boolean => priority <= 2;
