/**
 * Service for managing audience templates
 */

/**
 * Audience templates with predefined values for common scenarios
 */
export const audienceTemplates = [

  {
    id: 'pageviews',
    displayName: 'PageViews (All Pages)', // corrected 'displayNamen' to 'displayName'
    description: 'Users who viewed all pages but didn\'t purchase',
    icon: 'visibility',
    config: {
      displayName: 'Page Views (All Pages)',
      description: 'Users who viewed all pages but didn\'t make a purchase',
      membershipLifeSpan: 60,
      conditions: [
        "QMF_BASELINE",
      ],
      generatedURLPatternRegex: '^(/)$'
    }
  },
  
];

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