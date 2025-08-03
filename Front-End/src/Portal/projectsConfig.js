// Shared projects configuration
export const projects = [
  { name: 'HandBook' },
  { name: 'Arc C1' },
  { name: 'Lucid Air' },
];

// Function to convert project name to URL-friendly format
export const nameToUrl = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Get default project
export const getDefaultProject = () => {
  return nameToUrl(projects[0]?.name || 'handbook');
};
