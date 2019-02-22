import request from "request-promise-native";
import { Listing, Amenity } from "./types";

let isFetching = false;

export async function getAmenities(listing: Listing): Promise<Amenity[]> {
  let missingIds = [];
  const filteredIds = listing.amenityIds.filter(
    x => ignoredIds.find(y => y === x) === undefined
  );
  const cachedAmenities = filteredIds.map(id => cache[id]).filter(x => x);
  if (cachedAmenities.length === filteredIds.length) {
    return cachedAmenities;
  }
  if (isFetching) {
    return new Promise(resolve =>
      setTimeout(() => resolve(getAmenities(listing)), 500)
    ) as Promise<Amenity[]>;
  }

  isFetching = true;

  filteredIds.forEach(id => {
    if (!cache[id]) {
      missingIds.push(id);
    }
  });

  let res: any;

  try {
    res = await request(`https://www.airbnb.ae/rooms/${listing.id}`);
  } catch {
    isFetching = false;
    return [];
  }
  isFetching = false;
  if (!res) return [];
  const match = res.match(/{"listing_amenities":(\[.*?\])/);
  if (match) {
    const amenities: Amenity[] = JSON.parse(match[1]).map((x: Amenity) => ({
      name: x.name,
      id: x.id
    }));
    amenities.forEach(x => (cache[x.id] = x));
    missingIds.forEach(id => {
      if (!cache[id]) ignoredIds.push(id);
    });
    // console.log("Updated ignoredIds");
    // console.log(JSON.stringify(ignoredIds));
    // console.log("New cache size:", Object.keys(cache).length);
    // console.log("New Cache Elements:");
    // console.log(JSON.stringify(idsToPrint.map(x => cache[x]), null, 4));
    // console.log(JSON.stringify(JSON.parse(match[1]), null, 4));
    // console.log("Cache size:", Object.keys(cache).length);
    return amenities;
  }
  console.error(
    new Error("Couldn't find listing amenities in the returned request")
  );
  return [];
}

const ignoredIds = [
  3,
  6,
  11,
  14,
  17,
  19,
  28,
  31,
  32,
  38,
  43,
  49,
  50,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  120,
  121,
  123,
  125,
  126,
  127,
  128,
  131,
  136,
  296
];

const cache: { [key: number]: Amenity } = {
  1: {
    name: "TV",
    id: 1
  },
  2: {
    name: "Cable TV",
    id: 2
  },
  4: {
    name: "Wifi",
    id: 4
  },
  5: {
    name: "Air conditioning",
    id: 5
  },
  7: {
    name: "Pool",
    id: 7
  },
  8: {
    name: "Kitchen",
    id: 8
  },
  9: {
    name: "Free parking on premises",
    id: 9
  },
  10: {
    name: "Paid parking off premises",
    id: 10
  },
  12: {
    name: "Pets allowed",
    id: 12
  },
  15: {
    name: "Gym",
    id: 15
  },
  16: {
    name: "Breakfast",
    id: 16
  },
  21: {
    name: "Elevator",
    id: 21
  },
  23: {
    name: "Free street parking",
    id: 23
  },
  25: {
    name: "Hot tub",
    id: 25
  },
  27: {
    name: "Indoor fireplace",
    id: 27
  },
  30: {
    name: "Heating",
    id: 30
  },
  33: {
    name: "Washer",
    id: 33
  },
  34: {
    name: "Dryer",
    id: 34
  },
  35: {
    name: "Smoke detector",
    id: 35
  },
  36: {
    name: "Carbon monoxide detector",
    id: 36
  },
  37: {
    name: "First aid kit",
    id: 37
  },
  39: {
    name: "Fire extinguisher",
    id: 39
  },
  40: {
    name: "Essentials",
    id: 40
  },
  41: {
    name: "Shampoo",
    id: 41
  },
  42: {
    name: "Lock on bedroom door",
    id: 42
  },
  44: {
    name: "Hangers",
    id: 44
  },
  45: {
    name: "Hair dryer",
    id: 45
  },
  46: {
    name: "Iron",
    id: 46
  },
  47: {
    name: "Laptop friendly workspace",
    id: 47
  },
  51: {
    name: "Self check-in",
    id: 51
  },
  52: {
    name: "Smart lock",
    id: 52
  },
  53: {
    name: "Keypad",
    id: 53
  },
  54: {
    name: "Lockbox",
    id: 54
  },
  55: {
    name: "Building staff",
    id: 55
  },
  56: {
    name: "Private living room",
    id: 56
  },
  57: {
    name: "Private entrance",
    id: 57
  },
  59: {
    name: "Baby monitor",
    id: 59
  },
  60: {
    name: "Outlet covers",
    id: 60
  },
  61: {
    name: "Bathtub",
    id: 61
  },
  62: {
    name: "Baby bath",
    id: 62
  },
  63: {
    name: "Changing table",
    id: 63
  },
  64: {
    name: "High chair",
    id: 64
  },
  65: {
    name: "Stair gates",
    id: 65
  },
  66: {
    name: "Children’s books and toys",
    id: 66
  },
  67: {
    name: "Window guards",
    id: 67
  },
  69: {
    name: "Fireplace guards",
    id: 69
  },
  70: {
    name: "Babysitter recommendations",
    id: 70
  },
  71: {
    name: "Crib",
    id: 71
  },
  72: {
    name: "Pack ’n Play/travel crib",
    id: 72
  },
  73: {
    name: "Room-darkening shades",
    id: 73
  },
  74: {
    name: "Children’s dinnerware",
    id: 74
  },
  75: {
    name: "Game console",
    id: 75
  },
  77: {
    name: "Hot water",
    id: 77
  },
  85: {
    name: "Bed linens",
    id: 85
  },
  86: {
    name: "Extra pillows and blankets",
    id: 86
  },
  87: {
    name: "Ethernet connection",
    id: 87
  },
  88: {
    name: "Pocket wifi",
    id: 88
  },
  89: {
    name: "Microwave",
    id: 89
  },
  90: {
    name: "Coffee maker",
    id: 90
  },
  91: {
    name: "Refrigerator",
    id: 91
  },
  92: {
    name: "Dishwasher",
    id: 92
  },
  93: {
    name: "Dishes and silverware",
    id: 93
  },
  94: {
    name: "Cooking basics",
    id: 94
  },
  95: {
    name: "Oven",
    id: 95
  },
  96: {
    name: "Stove",
    id: 96
  },
  97: {
    name: "EV charger",
    id: 97
  },
  98: {
    name: "Single level home",
    id: 98
  },
  99: {
    name: "BBQ grill",
    id: 99
  },
  100: {
    name: "Patio or balcony",
    id: 100
  },
  101: {
    name: "Garden or backyard",
    id: 101
  },
  102: {
    name: "Beach essentials",
    id: 102
  },
  103: {
    name: "Luggage dropoff allowed",
    id: 103
  },
  104: {
    name: "Long term stays allowed",
    id: 104
  },
  107: {
    name: "Cleaning before checkout",
    id: 107
  },
  129: {
    name: "Host greets you",
    id: 129
  },
  132: {
    name: "Waterfront",
    id: 132
  },
  133: {
    name: "Lake access",
    id: 133
  },
  134: {
    name: "Beachfront",
    id: 134
  },
  135: {
    name: "Ski-in/Ski-out",
    id: 135
  },
  285: {
    name: "Full kitchen",
    id: 285
  },
  287: {
    name: "Paid parking on premises",
    id: 287
  },
  292: {
    name: "Bedroom comforts",
    id: 292
  },
  293: {
    name: "Bathroom essentials",
    id: 293
  }
};
