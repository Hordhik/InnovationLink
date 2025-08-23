
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

// User to project mapping
export const userProjectMap = {
  'manikant': 'HandBook',
  'arcuser': 'Arc C1',
  'luciduser': 'Lucid Air',
  // Add more users as needed
};

// Get project for a username
export const getProjectForUser = (username) => {
  const projectName = userProjectMap[username] || projects[0].name;
  return nameToUrl(projectName);
};

// Get default project (still used for fallback)
export const getDefaultProject = () => {
  return nameToUrl(projects[0]?.name || 'handbook');
};
