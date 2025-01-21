import conditions from './conditions.json';

export class AudienceFilterBuilder {
    constructor() {
        this.urlPatterns = [];
        this.conditionType = '';
    }

    addUrlPattern(patterns) {
        this.urlPatterns = patterns;
    }

    setConditionType(conditionType) {
        this.conditionType = conditionType;
    }

    build(id, displayName, membershipDurationDays, conditionType) {
        this.setConditionType(conditionType);
        return {
            id,
            displayName,
            membershipDurationDays,
            filter: {
                urlPatterns: this.urlPatterns,
                conditionType: this.conditionType
            }
        };
    }
}

export function getAvailableFilterOptions() {
    return Object.keys(conditions).map(key => ({
        value: key,
        label: key.toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
    }));
}