export const getFilterClausesByCondition = (conditionName, urlPatternExpressions) => {
  const conditionsConfig = require('../../resources/conditions.json');
  const condition = conditionsConfig[conditionName];
  
  if (!condition) {
    throw new Error(`Unknown condition: ${conditionName}`);
  }

  // Create a condition expression based on the condition type
  let conditionExpression;
  if (condition.type === 'event') {
    conditionExpression = {
      eventFilter: {
        eventName: condition.eventName
      }
    };
  } else if (condition.type === 'user_property') {
    conditionExpression = {
      userPropertyFilter: {
        userProperty: condition.propertyName,
        stringFilter: {
          matchType: condition.matchType || "EXACT",
          value: condition.value
        }
      }
    };
  } else {
    throw new Error(`Unsupported condition type: ${condition.type}`);
  }

  return [{
    clauseType: "INCLUDE",
    simpleFilter: {
      scope: condition.scope || "AUDIENCE_FILTER_SCOPE_WITHIN_SAME_SESSION",
      filterExpression: {
        andGroup: {
          filterExpressions: [
            // URL patterns (any of these)
            {
              orGroup: {
                filterExpressions: urlPatternExpressions
              }
            },
            // The condition itself
            conditionExpression
          ]
        }
      }
    }
  }];
};
