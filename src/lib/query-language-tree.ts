export interface TreeValue {
  /**
   * This will test whether the value matches a word. Word can be a partial word
   * at the end of a query that hasn't been done typing yet
   */
  matchWithWord(word: string): boolean;
}

export class StringTreeValue implements TreeValue {
  constructor(private stringValue: string) {}

  matchWithWord(word: string): boolean {
    return word.startsWith(this.stringValue);
  }
}

// export type TreeValue =
//   | string
//   | {
//       type: "location";
//     }
//   | { type: "distance" }
//   | {
//       type: "daterange";
//     }
//   | { type: "pricerange" };

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
        { values: ["in"], children: [{ values: [{ type: "location" }] }] },
        {
          values: ["near"],
          children: [{ values: [{ type: "location" }, ...placeTypes] }]
        },
        {
          values: ["within"],
          children: [
            {
              values: [{ type: "distance" }],
              children: [
                {
                  values: ["from"],
                  children: [{ values: [{ type: "location" }, ...placeTypes] }]
                }
              ]
            }
          ]
        },
        {
          values: ["has"],
          children: [{ values: ["a gym", "laundry available"] }]
        },
        {
          values: ["available"],
          children: [
            {
              values: ["during"],
              children: [{ values: [{ type: "daterange" }] }]
            },
            {
              values: ["for"],
              children: [
                {
                  values: [
                    "subletting",
                    "short-term (vacation) rental",
                    "long-term rental"
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      values: ["costs"],
      children: [{ values: [{ type: "pricerange" }] }]
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
