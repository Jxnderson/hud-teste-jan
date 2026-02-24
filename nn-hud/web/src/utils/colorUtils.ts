// Helper function to get CSS variable value (reads fresh value from inline styles)
export const getCSSVariable = (variable: string, fallback: string): string => {
  // First try to get the value directly from the inline styles (most up-to-date)
  let color = document.documentElement.style.getPropertyValue(variable);
  
  // If not found in inline styles, get from computed styles
  if (!color) {
    // Force a fresh computation by getting computed style
    const computedStyle = getComputedStyle(document.documentElement);
    color = computedStyle.getPropertyValue(variable);
  }
  
  // Fallback to default if still not found
  if (!color) {
    color = fallback;
  }
  
  return color.trim();
};

// Helper function to get CSS variable with alpha transparency
export const getCSSVariableWithAlpha = (variable: string, fallback: string, alpha: number): string => {
  const cleanColor = getCSSVariable(variable, fallback);
  
  // Convert hex to rgba
  if (cleanColor.startsWith('#')) {
    const hex = cleanColor.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // If it's already an rgb/rgba color, try to modify the alpha
  if (cleanColor.startsWith('rgb')) {
    const rgbMatch = cleanColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
    }
  }
  
  return cleanColor;
}; 