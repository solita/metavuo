const convertStatus = (id) => {
  switch (id) {
    case 1:
      return 'In Progress';
    case 2:
      return 'Complete';
    case 3:
      return 'Archived';
    default: return 'Unknown status';
  }
};

export { convertStatus as default };
