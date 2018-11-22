const query_overpass = require("query-overpass");
const omitDeep = require("omit-deep-lodash");
const _ = require("lodash");

function getOSMDataWithinBoundary(boundaryBox) {
  return new Promise((resolve, reject) => {
    query_overpass(
      //       `
      //   (
      //       node(56.06,9.95,56.1,10.06)[amenity="restaurant"];
      //       node(56.06,9.95,56.1,10.06)[amenity="fast_food"];
      //       node(56.06,9.95,56.1,10.06)[amenity="cafe"];
      //   );
      //   out body;
      // `,
      `
  ( area[name="Paris"]; )->.a;
  (
    node(area.a)[tourism];
  );
  out body;
`,
      (error, data) => {
        if (error) {
          console.error(error);
          reject(error);
        }
        resolve(data);
      },
      { flatProperties: true }
    );
  });
}

getOSMDataWithinBoundary().then(x => console.log(JSON.stringify(x, null, 4)));
