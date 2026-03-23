export function roleLabel(role) {
  switch (role) {
    case 'ADMIN':
      return 'Администратор';
    case 'LIBRARIAN':
      return 'Библиотекарь';
    case 'READER':
      return 'Читатель';
    default:
      return role || '';
  }
}

