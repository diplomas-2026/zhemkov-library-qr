export function readerRoleTypeLabel(value) {
  switch (value) {
    case 'STUDENT':
      return 'Ученик';
    case 'TEACHER':
      return 'Учитель';
    default:
      return value || '';
  }
}

export function loanStatusLabel(value) {
  switch (value) {
    case 'ACTIVE':
      return 'На руках';
    case 'RETURNED':
      return 'Возвращено';
    case 'OVERDUE':
      return 'Просрочено';
    default:
      return value || '';
  }
}

