export const applyTheme = (colors: any) => {
  if (!colors) return;
  
  const styles = `
    /* Public Theme */
    .public {
      --bg: ${colors.bg} !important;
      --bg-card: ${colors.bgCard} !important;
      --border: ${colors.border} !important;
      --text: ${colors.text} !important;
      --text-muted: ${colors.textMuted} !important;
      --accent: ${colors.accent} !important;
      --bg-nav: ${colors.bg}dd !important;
    }

    /* Private Theme Overrides */
    .private {
      --p-primary: ${colors.bg} !important;
      --p-surface: ${colors.bgCard} !important;
      --p-card-bg: ${colors.bgCard} !important;
      --p-card-border: ${colors.border} !important;
      --p-light: ${colors.text} !important;
      --p-accent: ${colors.accent} !important;
      --p-secondary: ${colors.accent} !important;
      --p-sidebar-bg: ${colors.bg} !important;
      --text-muted: ${colors.textMuted} !important;
      
      background: ${colors.bg} !important;
      color: ${colors.text} !important;
    }

    /* Private Dashboard Elements */
    .private .topbar {
      background: ${colors.bg} !important;
      border-bottom-color: ${colors.border} !important;
    }
    
    .private .sidebar {
      background: ${colors.bg} !important;
      border-right: 1px solid ${colors.border} !important;
    }
    
    .private .card, 
    .private .stat-card, 
    .private .ai-card {
      background: ${colors.bgCard} !important;
      border: 1px solid ${colors.border} !important;
      color: ${colors.text} !important;
    }

    .private .nav-item {
      color: ${colors.textMuted} !important;
    }

    .private .nav-item:hover {
      background: ${colors.bgCard} !important;
      color: ${colors.text} !important;
    }

    .private .nav-item.active {
      background: ${colors.accent}22 !important;
      color: ${colors.accent} !important;
      border: 1px solid ${colors.accent}44 !important;
    }

    .private .search-input, 
    .private .form-input,
    .private .tab-section .form-input {
      background: ${colors.bg} !important;
      border: 1px solid ${colors.border} !important;
      color: ${colors.text} !important;
    }

    .private .btn-primary {
      background: ${colors.accent} !important;
      color: ${colors.bg} !important;
    }

    .private .btn-ghost {
      color: ${colors.textMuted} !important;
    }

    .private .btn-ghost:hover {
      background: ${colors.bgCard} !important;
      color: ${colors.text} !important;
    }

    .private h1, .private h2, .private h3 {
      color: ${colors.text} !important;
    }

    .private .badge-blue {
      background: ${colors.accent}22 !important;
      color: ${colors.accent} !important;
      border: 1px solid ${colors.accent}44 !important;
    }
  `;

  let styleEl = document.getElementById('custom-appearance');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-appearance';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = styles;
};
