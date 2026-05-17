export const en = {
  common: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create',
    confirm: 'Confirm', loading: 'Loading...', search: 'Search', actions: 'Actions',
    name: 'Name', status: 'Status', active: 'Active', inactive: 'Inactive',
    yes: 'Yes', no: 'No', back: 'Back', logout: 'Sign out', seeSite: 'View site',
    loggedAs: 'Signed in as',
  },
  sidebar: {
    dashboard: 'Dashboard', pdv: 'POS — Sales', salesHistory: 'Sales history',
    stock: 'Inventory', financial: 'Finance', crm: 'CRM',
    catalog: 'Site catalog', siteImages: 'Site images', carousel: 'Carousel photos',
    banner: 'Promo banner', branding: 'Brand assets', settings: 'Settings',
  },
  settings: {
    title: 'Settings', subtitle: 'Language, users and theme',
    tabs: { language: 'Language', users: 'Users', themes: 'Themes' },
    language: {
      title: 'Panel language',
      desc: 'Select the interface language. Preference is saved per user.',
      save: 'Save language preference', saved: 'Language saved!',
    },
    themes: {
      title: 'Visual theme',
      desc: 'Choose a theme for the panel. Colors apply instantly.',
      apply: 'Save theme', saved: 'Theme saved!', current: 'Current theme',
    },
    users: {
      title: 'Members and permissions', newMember: 'New member', editMember: 'Edit member',
      fullName: 'Full name', username: 'Username', email: 'Email', password: 'Password',
      passwordHint: 'min. 6 characters', emailLocked: 'Email cannot be changed',
      permissionsTitle: 'Permissions per module', memberStatus: 'Member {{status}}',
      created: 'Member created successfully', updated: 'Member updated', deleted: 'Member deleted',
      confirmDelete: 'Delete member "{{name}}"? This action is irreversible.',
      noMembers: 'No members registered',
      setupHint: 'Initial setup: you are in PIN mode. Create the first member (master admin) now to start using username + password login.',
      activate: 'Activate', deactivate: 'Deactivate',
    },
  },
  login: {
    title: 'Panel access', subtitle: 'Sign in with email and password',
    email: 'Email or username', password: 'Password',
    show: 'Show', hide: 'Hide', enter: 'Sign in',
    pinFallback: 'Emergency access (PIN)', invalid: 'Invalid username or password',
  },
  denied: {
    title: 'Access denied',
    desc: 'You don\'t have permission to access this module. Request access from the administrator.',
  },
};
