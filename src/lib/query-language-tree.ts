export interface TreeValue {
  /**
   * This will test whether the value matches the rest of the query. Note that this could be
   * mid typing and have an unfinished word in it
   */
  matchRestOfQuery(restOfQuery: string[]): boolean;
}

export class StringTreeValue implements TreeValue {
  constructor(private stringValue: string) {}

  matchRestOfQuery(restOfQuery: string[]): boolean {
    const queryString = restOfQuery.join(" ").toLowerCase();
    return queryString.startsWith(this.stringValue.toLowerCase());
  }
}

export interface InputTreeValue extends TreeValue {}

export class LocationTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): boolean {
    if (restOfQuery.length === 0) return false;
    return true;
  }
}
export class DistanceTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): boolean {
    if (restOfQuery.length === 0) return false;
    return true;
  }
}
export class DateRangeTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): boolean {
    if (restOfQuery.length === 0) return false;
    return true;
  }
}
export class PriceRangeTreeValue implements InputTreeValue {
  matchRestOfQuery(restOfQuery: string[]): boolean {
    if (restOfQuery.length === 0) return false;
    return true;
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
  if (words.length === 0) {
    // We matched all the words in the query so we suggest all the possible next values
    return currentNode.children
      .map(x => x.values)
      .reduce((prev, cur) => prev.concat(cur));
  }

  const suggestions = currentNode.children
    .map(child => getTreeSuggestions(words.slice(1), child))
    .reduce((prev, cur) => prev.concat(cur));

  return suggestions;
}
