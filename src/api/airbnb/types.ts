export type Listing = {
  id: number;
  priceString: string;
  latitude: string;
  longitude: string;
  picture: string;
  type: string;
  title: string;
  amenityIds: number[];
  amenities?: Amenity[];
};

export type Amenity = {
  name: string;
  id: number;
};
