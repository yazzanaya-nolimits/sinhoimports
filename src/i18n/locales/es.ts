export const es = {
  common: {
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', create: 'Crear',
    confirm: 'Confirmar', loading: 'Cargando...', search: 'Buscar', actions: 'Acciones',
    name: 'Nombre', status: 'Estado', active: 'Activo', inactive: 'Inactivo',
    yes: 'Sí', no: 'No', back: 'Volver', logout: 'Salir', seeSite: 'Ver sitio',
    loggedAs: 'Conectado como',
  },
  sidebar: {
    dashboard: 'Panel general', pdv: 'TPV — Ventas', salesHistory: 'Historial de ventas',
    stock: 'Inventario', financial: 'Finanzas', crm: 'CRM',
    catalog: 'Catálogo del sitio', siteImages: 'Imágenes del sitio', carousel: 'Fotos del carrusel',
    banner: 'Banner promocional', settings: 'Configuración',
  },
  settings: {
    title: 'Configuración', subtitle: 'Idioma, usuarios y tema',
    tabs: { language: 'Idioma', users: 'Usuarios', themes: 'Temas' },
    language: {
      title: 'Idioma del panel',
      desc: 'Selecciona el idioma de la interfaz. La preferencia se guarda por usuario.',
      save: 'Guardar preferencia de idioma', saved: '¡Idioma guardado!',
    },
    themes: {
      title: 'Tema visual',
      desc: 'Elige un tema para el panel. Los colores se aplican al instante.',
      apply: 'Guardar tema', saved: '¡Tema guardado!', current: 'Tema actual',
    },
    users: {
      title: 'Miembros y permisos', newMember: 'Nuevo miembro', editMember: 'Editar miembro',
      fullName: 'Nombre completo', username: 'Nombre de usuario', email: 'Correo', password: 'Contraseña',
      passwordHint: 'mín. 6 caracteres', emailLocked: 'El correo no se puede cambiar',
      permissionsTitle: 'Permisos por módulo', memberStatus: 'Miembro {{status}}',
      created: 'Miembro creado exitosamente', updated: 'Miembro actualizado', deleted: 'Miembro eliminado',
      confirmDelete: '¿Eliminar miembro "{{name}}"? Esta acción es irreversible.',
      noMembers: 'No hay miembros registrados',
      setupHint: 'Configuración inicial: estás en modo PIN. Crea ahora el primer miembro (admin máster) para empezar a usar inicio de sesión con usuario y contraseña.',
      activate: 'Activar', deactivate: 'Desactivar',
    },
  },
  login: {
    title: 'Acceso al panel', subtitle: 'Inicia sesión con correo y contraseña',
    email: 'Correo o usuario', password: 'Contraseña',
    show: 'Mostrar', hide: 'Ocultar', enter: 'Entrar',
    pinFallback: 'Acceso de emergencia (PIN)', invalid: 'Usuario o contraseña incorrectos',
  },
  denied: {
    title: 'Acceso denegado',
    desc: 'No tienes permiso para acceder a este módulo. Solicita acceso al administrador.',
  },
};
