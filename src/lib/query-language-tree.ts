export type MatchObject = {
  matches: boolean;
  isPartialMatch?: boolean;
};

export type ModifiedMatchObject = MatchObject & {
  originalValue: TreeValue;
};

export interface TreeValue {
  /**
   * This will test whether the value matches the rest of the query. Note that this could be
   * mid typing and have an unfinished word in it
   */
  matchRestOfQuery(restOfQuery: string[]): MatchObject;
}

export class StringTreeValue implements TreeValue {
  constructor(private stringValue: string) {}

  matchRestOfQuery(restOfQuery: string[]): MatchObject {
    const queryString = restOfQuery.join(" ").toLowerCase();
    const targetContainsQuery = this.stringValue
      .toLowerCase()
      .startsWith(queryString);
    const queryContainsTarget = queryString.startsWith(
      this.stringValue.toLowerCase()
    );
    return {
      matches: targetContainsQuery,
      isPartialMatch: targetContainsQuery && !queryContainsTarget
    };
  }
}

export interface InputTreeValue extends TreeValue {}

export class LocationTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): MatchObject {
    if (restOfQuery.length === 0) return { matches: false };
    return { matches: true, isPartialMatch: true };
  }
}
export class DistanceTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): MatchObject {
    if (restOfQuery.length === 0) return { matches: false };
    return { matches: true, isPartialMatch: true };
  }
}
export class DateRangeTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): MatchObject {
    if (restOfQuery.length === 0) return { matches: false };
    return { matches: true, isPartialMatch: true };
  }
}
export class PriceRangeTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): MatchObject {
    if (restOfQuery.length === 0) return { matches: false };
    return { matches: true, isPartialMatch: true };
  }
}

export type TreeNode = {
  values: TreeValue[];
  children?: TreeNode[];
};

const placeTypes = [
  new StringTreeValue("a gym"),
  new StringTreeValue("a restaurant"),
  new StringTreeValue("a school")
];

export const treeRoot: TreeNode = {
  values: [],
  children: [
    {
      values: [new StringTreeValue("is")],
      children: [
        {
          values: [new StringTreeValue("in")],
          children: [{ values: [new LocationTreeValue()] }]
        },
        {
          values: [new StringTreeValue("near")],
          children: [{ values: [new LocationTreeValue(), ...placeTypes] }]
        },
        {
          values: [new StringTreeValue("within")],
          children: [
            {
              values: [new DistanceTreeValue()],
              children: [
                {
                  values: [new StringTreeValue("from")],
                  children: [
                    { values: [new LocationTreeValue(), ...placeTypes] }
                  ]
                }
              ]
            }
          ]
        },
        {
          values: [new StringTreeValue("has")],
          children: [
            {
              values: [
                new StringTreeValue("a gym"),
                new StringTreeValue("laundry available")
              ]
            }
          ]
        },
        {
          values: [new StringTreeValue("available")],
          children: [
            {
              values: [new StringTreeValue("during")],
              children: [{ values: [new DateRangeTreeValue()] }]
            },
            {
              values: [new StringTreeValue("for")],
              children: [
                {
                  values: [
                    new StringTreeValue("subletting"),
                    new StringTreeValue("short-term (vacation) rental"),
                    new StringTreeValue("long-term rental")
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      values: [new StringTreeValue("costs")],
      children: [{ values: [new PriceRangeTreeValue()] }]
    }
  ]
};

export function getTreeSuggestions(
  words: string[],
  currentNode: TreeNode = treeRoot
): TreeValue[] {
  if (!currentNode.children) {
    // No more children so this is a dead end
    return [];
  }

  const matches: ModifiedMatchObject[] =
    currentNode === treeRoot
      ? [{ matches: true, originalValue: new StringTreeValue(" ") }]
      : currentNode.values.map(value => ({
          ...value.matchRestOfQuery(words),
          originalValue: value
        }));

  const hasFullMatches = matches.some(x => x.matches && !x.isPartialMatch);
  const hasPartialMatches = matches.some(
    x => x.matches && x.isPartialMatch === true
  );
  const hasAnyMatches = hasFullMatches || hasPartialMatches;

  if (!hasAnyMatches) return [];

  if (words.length === 1 && currentNode !== treeRoot) {
    let suggestions: TreeValue[] = [];
    if (hasFullMatches) {
      suggestions = suggestions.concat(
        currentNode.children
          .map(x => x.values)
          .reduce((prev, cur) => prev.concat(cur))
      );
    }
    if (hasPartialMatches) {
      suggestions = suggestions.concat(
        matches
          .filter(x => x.matches && x.isPartialMatch === true)
          .map(x => x.originalValue)
      );
    }
    return suggestions;
  }

  const suggestions = currentNode.children
    .map(child =>
      getTreeSuggestions(words.slice(currentNode === treeRoot ? 0 : 1), child)
    )
    .reduce((prev, cur) => prev.concat(cur));

  return suggestions;
}
