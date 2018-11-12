export type TreeValue =
  | string
  | {
      type: "location";
    }
  | { type: "distance" }
  | {
      type: "daterange";
    }
  | { type: "pricerange" };

export type TreeNode = {
  values: TreeValue[];
  children?: TreeNode[];
};

const placeTypes = ["a gym", "a restaurant", "a school"];

export const treeRoot: TreeNode[] = [
  {
    values: ["is"],
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
];
