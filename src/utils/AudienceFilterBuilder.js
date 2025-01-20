class AudienceFilterBuilder {
  constructor() {
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
  }

  addUrlPattern(paths) {
    const urlFilter = {
      orGroup: {
        filterExpressions: [{
          dimensionOrMetricFilter: {
            fieldName: "landingPagePlusQueryString",
            atAnyPointInTime: true,
            inAnyNDayPeriod: 0,
            stringFilter: {
              matchType: "FULL_REGEXP",
              value: `^(${paths.map(p => p.replace('/', '\\/')).join('|')})$`,
              caseSensitive: false
            },
            oneFilter: "stringFilter"
          },
          expr: "dimensionOrMetricFilter"
        }]
      },
      expr: "orGroup"
    };

    this.filter.filterClauses[0].simpleFilter
      .filterExpression.andGroup.filterExpressions.push(urlFilter);
    return this;
  }

  addEvent(eventName, params = null) {
    const eventFilter = {
      orGroup: {
        filterExpressions: [{
          eventFilter: {
            eventName: eventName,
            eventParameterFilterExpression: params
          },
          expr: "eventFilter"
        }]
      },
      expr: "orGroup"
    };

    this.filter.filterClauses[0].simpleFilter
      .filterExpression.andGroup.filterExpressions.push(eventFilter);
    return this;
  }

  build(name, displayName, membershipDays = 60) {
    return {
      ...this.filter,
      name: `properties/279961840/audiences/${name}`,
      displayName: displayName,
      description: "",
      membershipDurationDays: membershipDays,
      adsPersonalizationEnabled: true,
      eventTrigger: null,
      exclusionDurationMode: "AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED"
    };
  }
}

export default AudienceFilterBuilder;
