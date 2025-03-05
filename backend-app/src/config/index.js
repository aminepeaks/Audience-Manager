import conditions from './conditions.json' assert { type: 'json' };

const replacePlaceholderExpressions = (filterClauses, filterExpressions) => {
  return filterClauses.map((filterClause) => {
    const stringified = JSON.stringify(filterClause);
    const replaced = stringified.replace(
      '"$filterExpressions"',
      JSON.stringify(filterExpressions)
    );

    return JSON.parse(replaced);
  });
};

const getFilterClausesByCondition = (condition, filterExpressions) => {
  const filterClauses = conditions[condition];

  if (filterClauses === undefined) {
    throw new Error(`Missing condition with name ${condition}`);
  }

  return replacePlaceholderExpressions(filterClauses, filterExpressions);
};

export { getFilterClausesByCondition };
