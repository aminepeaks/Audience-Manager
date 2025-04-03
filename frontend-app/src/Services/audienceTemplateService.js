/**
 * Service for managing audience templates
 */

const TEMPLATE_STORAGE_KEY = 'audienceTemplates';

// Load templates from localStorage or fallback to predefined templates
const loadTemplates = () => {
  const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  return storedTemplates ? JSON.parse(storedTemplates) : [
    {
      id: 'qmf_baseline',
      displayName: 'QMF Baseline',
      description: 'Users with QMF_BASELINE ',
      icon: 'PV',
      config: {
        displayName: 'Page Views (All Pages)',
        description: 'Users with QMF_BASELINE ',
        membershipLifeSpan: 60,
        conditions: ["QMF_BASELINE"],
        generatedURLPatternRegex: '^(/)$'
      }
    }
  ];
};

// Initialize audienceTemplates with loaded templates
export const audienceTemplates = loadTemplates();

/**
 * Get an audience template by ID
 */
export const getTemplateById = (templateId) => {
  return audienceTemplates.find(template => template.id === templateId);
};

/**
 * Get all available audience templates
 */
export const getAllTemplates = () => {
  return audienceTemplates;
};

/**
 * Save a new template to the local templates folder
 */
export const saveTemplateToFile = (template) => {
  // Add the new template to the audienceTemplates array
  audienceTemplates.push(template);

  // Save updated templates to localStorage
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(audienceTemplates));
};

/**
 * Remove a template by ID
 */
export const removeTemplateById = (templateId) => {
  const updatedTemplates = audienceTemplates.filter(template => template.id !== templateId);
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));
  return updatedTemplates;
};