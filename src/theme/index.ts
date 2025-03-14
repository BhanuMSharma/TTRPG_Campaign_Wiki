// Theme configuration for the application
export const theme = {
    // Color palette
    colors: {
      // Primary UI colors
      //primary: "#3498db",      // Blue used for primary actions and highlights
      primary: "#87c7ff",
      secondary: "#2ecc71",    // Green used for success and creation actions
      danger: "#e74c3c",       // Red used for delete/warning actions
      
      // Background colors
      background: {
        main: "#1a1a1a",       // Main app background
        dark: "#2c3e50",       // Darker panels (form containers, cards)
        darker: "#34495e",     // Even darker elements (inputs, sidebar)
        hover: "#2c3e50",      // Hover state for items
      },
      
      // Text colors
      text: {
        primary: "#ffffff",    // Primary text color (white)
        secondary: "#ecf0f1",  // Secondary text color (light gray)
        muted: "#95a5a6",      // Muted text for dates and less important info
      },
      
      // Border colors
      border: {
        light: "#ecf0f1",      // Light borders
        dark: "#34495e",       // Dark borders
      },
    },
    
    // Typography
    fonts: {
      // Font families
      family: {
        base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        monospace: "monospace",
      },
      
      // Font sizes
      size: {
        xs: "0.75rem",     // 12px
        sm: "0.875rem",    // 14px
        base: "1rem",      // 16px
        lg: "1.125rem",    // 18px
        xl: "1.25rem",     // 20px
        "2xl": "1.5rem",   // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem",  // 36px
      },
      
      // Font weights
      weight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
    
    // Spacing
    spacing: {
      xs: "0.25rem",   // 4px
      sm: "0.5rem",    // 8px
      md: "1rem",      // 16px
      lg: "1.5rem",    // 24px
      xl: "2rem",      // 32px
      "2xl": "3rem",   // 48px
    },
    
    // Border radius
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      round: "50%",
    },
    
    // Shadows
    shadows: {
      sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      md: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
      lg: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
    },
    
    // Transitions
    transitions: {
      fast: "0.2s",
      medium: "0.3s",
      slow: "0.5s",
    },
    
    // Media queries breakpoints
    breakpoints: {
      mobile: "768px",
      tablet: "1024px",
      desktop: "1280px",
    },
  };
  
  // Type definition for the theme
  export type Theme = typeof theme;
  
  // Helper function to access theme properties in styled components
  export const getTheme = (path: string, fallback?: string) => (props: { theme?: Theme }) => {
    if (!props.theme) {
        console.warn('Theme not available when accessing theme ${path}.');
        return fallback || undefined;
    }
    
    const pathParts = path.split('.');
    let result: any = props.theme;
    
    for (const part of pathParts) {
      if (result[part] === undefined) {
        return fallback || undefined;
      }
      result = result[part];
    }
    
    return result || fallback;
  };