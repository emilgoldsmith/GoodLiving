const inquirer = require("inquirer");

main();

async function main() {
  const airbnb = "AirBnB";
  const propertyFinder = "Property Finder";
  const streetEasy = "StreetEasy";

  const { target } = await inquirer.prompt([
    {
      type: "list",
      name: "target",
      choices: [airbnb, propertyFinder, streetEasy]
    }
  ]);

  let targetUrl;

  if (target === airbnb) {
    targetUrl = await getAirbnbUrl();
  } else {
    console.error("Invalid target option selected", target);
    process.exit(1);
  }
  console.log(`Please access this url to see your search: ${targetUrl}`);
}

async function getAirbnbUrl() {
  const isInt = str => /[0-9]+/.test(str);
  const isFloat = str => /[0-9]+(?:\.[0-9]+)?/.test(str);
  const {
    maxPrice,
    minPrice,
    swLat,
    swLong,
    neLat,
    neLong
  } = await inquirer.prompt([
    {
      type: "input",
      name: "swLat",
      message:
        "What is the latitude of the southwest corner of your search square?",
      validate: isFloat
    },
    {
      type: "input",
      name: "swLong",
      message:
        "What is the longtitude of the southwest corner of your search square?",
      validate: isFloat
    },
    {
      type: "input",
      name: "neLat",
      message:
        "What is the latitude of the northeast corner of your search square?",
      validate: isFloat
    },
    {
      type: "input",
      name: "neLong",
      message:
        "What is the longtitude of the northeast corner of your search square?",
      validate: isFloat
    },
    {
      type: "input",
      name: "minPrice",
      message: "what is the minimum price you are willing to pay per night?",
      validate: isInt
    },
    {
      type: "input",
      name: "maxPrice",
      message: "what is the maximum price you are willing to pay per night?",
      validate: isInt
    }
  ]);

  const baseUrl = "https://www.airbnb.ae/s/homes";
  const queryString = `map_toggle=true&search_by_map=true&sw_lat=${swLat}&sw_lng=${swLong}&ne_lat=${neLat}&ne_lng=${neLong}&price_max=${maxPrice}&price_min=${minPrice}`;
  return `${baseUrl}?${queryString}`;
}
