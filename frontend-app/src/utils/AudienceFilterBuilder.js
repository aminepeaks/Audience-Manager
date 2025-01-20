class AudienceFilterBuilder {
  constructor() {
    // Cache common paths
    this._filterExpressionsPath = ['filterClauses', 0, 'simpleFilter', 'filterExpression', 'andGroup', 'filterExpressions'];
    
    this.filter = {
      filterClauses: [{
        clauseType: "INCLUDE",
        simpleFilter: {
          scope: "AUDIENCE_FILTER_SCOPE_WITHIN_SAME_SESSION",
          filterExpression: {
            andGroup: {
              filterExpressions: []
            }
          }
        }
      }]
    };

    // Cache filter expressions for faster access
    this.filterExpressions = this.filter.filterClauses[0].simpleFilter
      .filterExpression.andGroup.filterExpressions;
  }

  addUrlPattern(paths) {
    if (!paths?.length) return this;

    // Pre-compile regexp pattern
    const pattern = `^(${paths.map(p => p.replace(/\//g, '\\/')).join('|')})$`;
    
    const urlFilter = {
      orGroup: {
        filterExpressions: [{
          dimensionOrMetricFilter: {
            fieldName: "landingPagePlusQueryString",
            atAnyPointInTime: true,
            inAnyNDayPeriod: 0,
            stringFilter: {
              matchType: "FULL_REGEXP",
              value: pattern,
              caseSensitive: false
            },
            oneFilter: "stringFilter"
          },
          expr: "dimensionOrMetricFilter"
        }]
      },
      expr: "orGroup"
    };

    this.filterExpressions.push(urlFilter);
    return this;
  }

  addEvent(eventName, params = null) {
    if (!eventName) return this;

    const eventFilter = {
      orGroup: {
        filterExpressions: [{
          eventFilter: {
            eventName,
            ...(params && { eventParameterFilterExpression: params })
          },
          expr: "eventFilter"
        }]
      },
      expr: "orGroup"
    };

    this.filterExpressions.push(eventFilter);
    return this;
  }

  build(name, displayName, membershipDays = 60) {
    return {
      ...this.filter,
      name: `properties/279961840/audiences/${name}`,
      displayName,
      description: "",
      membershipDurationDays: membershipDays,
      adsPersonalizationEnabled: true,
      eventTrigger: null,
      exclusionDurationMode: "AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED"
    };
  }
}

export default AudienceFilterBuilder;
