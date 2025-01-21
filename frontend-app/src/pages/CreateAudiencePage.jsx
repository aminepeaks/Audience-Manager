import React from 'react';
import AudienceForm from '../components/AudienceForm';
import AudienceFilterBuilder from '../utils/AudienceFilterBuilder';
import { createAudience } from '../api/audienceApi';

const CreateAudiencePage = ({ selectedProperties, selectedAccount }) => {
    return (
        <AudienceForm
            properties={selectedProperties}
            onSubmit={(data) => {
                try {
                    const builder = new AudienceFilterBuilder();
                    
                    // Add URL patterns from form data
                    if (data.urlPatterns) {
                        const patterns = data.urlPatterns
                            .split('\n')
                            .filter(p => p.trim());
                        builder.addUrlPattern(patterns);
                    }

                    // Build audience with selected condition
                    const audience = builder.build(
                        'unique-id', // Will be assigned by backend
                        data.displayName,
                        data.membershipDurationDays,
                        data.conditionType // Selected from predefined conditions
                    );

                    // Call backend API to create audience
                    createAudience({
                        accountName: selectedAccount,
                        audienceDefinition: audience,
                        selectedProperties: selectedProperties
                    });

                } catch (error) {
                    console.error('Error creating audience:', error);
                }
            }}
        />
    );
};

export default CreateAudiencePage;
