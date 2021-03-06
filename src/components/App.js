import React, { Component } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "./App.module.scss";
import { queryGeneralData } from "../api/general-api-client";
import MainInput from "./MainInput";
import FormInput from "./FormInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import * as NumericInput from "react-numeric-input";
import { Range } from "rc-slider";
import * as _ from "lodash";
import { debounce } from "throttle-debounce";
import * as Modal from "react-modal";
import Spinner from "./Spinner";
import browserDetect from "browser-detect";
import ChooseDistanceModal, {
  metersToDisplayString
} from "./ChooseDistanceModal";
import "rc-slider/assets/index.css";
// Overwriting default styles of NumericInput
NumericInput.style.input = {};
NumericInput.style["input:not(.form-control)"] = {};
// Overwriting default styles of Modal
Modal.defaultStyles.overlay.zIndex = 1000000000000000;
Modal.setAppElement("#root");

const browserInfo = browserDetect();

if (browserInfo.name !== "chrome" && browserInfo.name !== "firefox") {
  window.alert(
    "We currently only officially support the Chrome and Firefox browsers so bugs may appear in the browser you are currently using"
  );
}

// const OldFilter = ({ iconType }) => {
//   let icon, description;
//   switch (iconType) {
//     case "gym":
//       icon = (
//         <div className={`${styles.iconContainer} ${styles.gymIcon}`}>
//           <i className="fas fa-dumbbell" />
//         </div>
//       );
//       description = (
//         <span>
//           Gym Within <input type="number" defaultValue={500} />m
//         </span>
//       );
//       break;

//     default:
//       throw new Error("Invalid iconType");
//   }

//   return (
//     <div className={styles.oldFilter}>
//       {icon}
//       {description}
//       <div className={styles.growingFlex}>
//         <button className={styles.unstyledButton}>
//           <i className="fas fa-times" />
//         </button>
//       </div>
//     </div>
//   );
// };

class Filter extends Component {
  remove = () => this.props.removeFilter(this.props.filterValue);
  edit = () =>
    this.props.editFilter({
      value: this.props.filterValue,
      minDist: this.props.minDist,
      maxDist: this.props.maxDist
    });

  render() {
    const { filterValue } = this.props;
    return (
      <div className={styles.filter}>
        <div
          className={styles.filterText}
          title={
            this.props.minDist !== undefined
              ? `Between ${metersToDisplayString(
                  this.props.minDist
                )} and ${metersToDisplayString(
                  this.props.maxDist
                )} from ${filterValue}`
              : `Has ${filterValue}`
          }
        >
          {filterValue}
        </div>
        <div className={styles.filterButtonsContainer}>
          <button className={styles.filterButton} onClick={this.remove}>
            <i className="fas fa-trash-alt" />
          </button>
          {this.props.editFilter && (
            <button className={styles.filterButton} onClick={this.edit}>
              <i className="fas fa-cog" />
            </button>
          )}
        </div>
      </div>
    );
  }
}

const PropertyResult = ({
  previewUrl,
  title,
  subtitle,
  listingId,
  priceString,
  isPopup,
  highlightMarker,
  resetMarker
}) => {
  return (
    <a
      className={`${styles.propertyResult}${
        isPopup ? ` ${styles.isPopup}` : ""
      }`}
      target="_blank"
      rel="noopener noreferrer"
      href={`https://www.airbnb.com/rooms/${listingId}`}
      onMouseOver={() => highlightMarker && highlightMarker()}
      onMouseOut={() => resetMarker && resetMarker()}
    >
      {/* <div className={styles.propertyAttributesContainer}>
        <h1>Attributes</h1>
        {attributes.map(singleAttribute => (
          <Filter iconType="gym" key={x++} />
        ))}
      </div> */}
      <div className={styles.leftHandSide}>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        <h2>{priceString}</h2>
        <img src={previewUrl} alt="property preview" />
      </div>
    </a>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      nearData: {},
      minDate: null,
      maxDate: null,
      numGuests: 1,
      minPrice: 0,
      maxPrice: 1000,
      roomType: "message",
      amenities: [],
      nearbyFilters: [],
      amenityFilters: [],
      choosingDistance: false,
      filterData: null,
      loading: false,
      hasLoadedFirstTime: false
    };

    this.youAreHereIcon = L.icon({
      iconUrl: `${process.env.PUBLIC_URL}/you-are-here.png`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  }

  moveMap = boundingbox => {
    const latLngBounds = [
      [boundingbox[0], boundingbox[2]],
      [boundingbox[1], boundingbox[3]]
    ];
    this.map.fitBounds(latLngBounds);
  };

  highlightMarker = marker => {
    this.markers.forEach(x => x !== marker && x.setOpacity(0.15));
  };

  restoreMarkerOpacities = () => {
    this.markers.forEach(x => x.setOpacity(1));
  };

  updateResults = listings => {
    this.markers.forEach(oldMarker => oldMarker.remove());
    this.markers = listings.map(singleLocation =>
      Object.assign(
        L.marker(
          [singleLocation.latitude, singleLocation.longitude],
          L.icon({ ...L.Icon.Default.prototype.options })
        )
          .bindPopup(
            renderToStaticMarkup(
              <PropertyResult
                title={singleLocation.title}
                subtitle={singleLocation.type}
                previewUrl={singleLocation.picture}
                listingId={singleLocation.id}
                priceString={singleLocation.priceString}
                isPopup
              />
            )
          )
          .addTo(this.map),
        { listingId: singleLocation.id }
      )
    );
    this.setState(state => ({
      amenities: _.uniq(
        _.flatten(listings.map(listing => listing.amenities.map(x => x.name)))
      ).filter(
        amenity => state.amenityFilters.findIndex(x => x === amenity) === -1
      )
    }));
  };

  isTooZoomedOut = () => {
    return this.map && this.map.getZoom() < 10;
  };

  updateMap = debounce(750, async event => {
    this.setState({ loading: true });
    try {
      if (this.isTooZoomedOut()) {
        // Zoomed out too far
        this.setState({
          loading: false,
          hasLoadedFirstTime: true,
          results: [],
          nearData: []
        });
        // Clears all markers
        this.updateResults([]);
        return;
      }

      const bounds = this.map.getBounds();
      const { lng: swLong, lat: swLat } = bounds.getSouthWest();
      const { lng: neLong, lat: neLat } = bounds.getNorthEast();
      const { airbnbResults: results, OSMData } = await queryGeneralData(
        swLat,
        swLong,
        neLat,
        neLong,
        this.state.minPrice,
        this.state.maxPrice,
        moment(this.state.minDate).isValid()
          ? moment(this.state.minDate).format("YYYY-MM-DD")
          : "",
        moment(this.state.maxDate).isValid()
          ? moment(this.state.maxDate).format("YYYY-MM-DD")
          : "",
        this.state.numGuests,
        this.state.roomType === "message" ? "" : this.state.roomType,
        this.state.amenityFilters,
        this.state.nearbyFilters
      );
      // Don't update results if we're too zoomed out
      if (this.isTooZoomedOut()) {
        return;
      }
      this.updateResults(results);
      this.setState({
        results: results.slice(0, 20),
        nearData: this.formatOSMData(OSMData),
        loading: false,
        hasLoadedFirstTime: true
      });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false, hasLoadedFirstTime: true });
    }
  });

  formatOSMData = OSMData => {
    const getOSMName = node =>
      node.properties["name:en"] || node.properties.name;
    const notFalsy = x => x;
    const addMetaDataToString = (string, metaData) => {
      // It's falsy
      if (!string) return string;
      return {
        value: string,
        _meta: metaData
      };
    };
    const nodeToKeyValuePairs = node =>
      _.map(node.properties, (value, key) => [key, value]);
    const nodeToSpecificPlace = node =>
      addMetaDataToString(getOSMName(node), {
        keyValuePairs: nodeToKeyValuePairs(node),
        requireAllPairs: true
      });
    const isNotAlreadyPicked = obj =>
      this.state.nearbyFilters.findIndex(x => x.value === obj.value) === -1;

    return {
      restaurants: {
        "specific restaurants": OSMData.restaurants
          .map(nodeToSpecificPlace)
          .filter(notFalsy)
          .filter(isNotAlreadyPicked),
        cuisines: OSMData.restaurants
          .filter(x => x.properties.cuisine)
          .map(x =>
            addMetaDataToString(x.properties.cuisine, {
              keyValuePairs: [["cuisine", x.properties.cuisine]],
              requireAllPairs: true
            })
          )
          .filter(isNotAlreadyPicked)
      },
      "tourist attractions": OSMData.touristAttractions
        .map(nodeToSpecificPlace)
        .filter(notFalsy)
        .filter(isNotAlreadyPicked),
      "leisure areas": OSMData.leisureAreas
        .map(nodeToSpecificPlace)
        .filter(notFalsy)
        .filter(isNotAlreadyPicked),
      "public transportation": [
        addMetaDataToString("Any Public Transportation", {
          keyValuePairs: [
            ["public_transport", "stop_position"],
            ["public_transport", "platform"],
            ["public_transport", "station"],
            ["highway", "bus_stop"]
          ].filter(isNotAlreadyPicked)
        })
      ]
    };
  };

  componentDidMount() {
    // L is the LeafletJS variable
    /* global L:false */
    // 'map' is the id of the div where map is going to go
    this.map = L.map("map").locate({ setView: true, maxZoom: 14 });
    this.map.on("locationfound", async event => {
      if (this.youAreHereMarker) {
        this.youAreHereMarker.remove();
      }
      this.youAreHereMarker = L.marker(event.latlng, {
        icon: this.youAreHereIcon
      }).addTo(this.map);
    });
    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken:
          "pk.eyJ1IjoiZ29sZHNtaXRoIiwiYSI6ImNqbm5ldmRmbTB1bjMzcG1xb283Ymt5eXUifQ.8nAfe1b0qiI98h1XunG4ag"
      }
    ).addTo(this.map);

    this.markers = [];

    this.map.on("moveend", this.updateMap);
  }

  locate = () => {
    this.map.locate({ setView: true, maxZoom: 14 });
  };

  handleDateChangeStart = newStart => {
    if (moment(newStart).isAfter(this.state.endDate)) {
      this.setState(
        { minDate: moment(newStart), maxDate: moment(newStart) },
        this.updateMap
      );
    } else {
      this.setState({ minDate: moment(newStart) }, this.updateMap);
    }
  };

  handleDateChangeEnd = newEnd =>
    this.setState({ maxDate: moment(newEnd) }, this.updateMap);

  handleGuestsChanged = numGuests =>
    this.setState({ numGuests }, this.updateMap);

  handlePriceChanged = priceRange => {
    this.setState(
      { minPrice: priceRange[0], maxPrice: priceRange[1] },
      this.updateMap
    );
  };

  handleRoomTypeChanged = event =>
    this.setState({ roomType: event.target.value }, this.updateMap);

  addAmenityFilter = val =>
    this.setState(
      state => ({
        amenityFilters: state.amenityFilters.concat([val])
      }),
      this.updateMap
    );

  addNearbyFilter = ({ value, meta, distances: [minDist, maxDist] }) => {
    this.setState(state => {
      let newNearbyFilters;
      if (state.editingDistance) {
        newNearbyFilters = state.nearbyFilters.slice();
        const indexToEdit = newNearbyFilters.findIndex(x => x.value === value);
        if (indexToEdit === -1) {
          console.error("Can't find any filter with value", value);
          // Just let newNearbyFilters be the copy
        } else {
          newNearbyFilters[indexToEdit] = {
            ...newNearbyFilters[indexToEdit],
            minDist,
            maxDist
          };
        }
      } else {
        newNearbyFilters = state.nearbyFilters.concat([
          {
            value,
            keyValuePairs: meta.keyValuePairs,
            requireAllPairs: meta.requireAllPairs,
            minDist,
            maxDist
          }
        ]);
      }
      return {
        nearbyFilters: newNearbyFilters,
        choosingDistance: false,
        editingDistance: false,
        filterData: null
      };
    }, this.updateMap);
  };

  redirectToSelectDistance = (value, meta) =>
    this.setState({ choosingDistance: true, filterData: { value, meta } });

  redirectToEditDistance = filterData =>
    this.setState({ editingDistance: true, filterData });

  closeModal = () =>
    this.setState({
      choosingDistance: false,
      editingDistance: false,
      filterData: null
    });

  removeNearbyFilter = value => {
    this.setState(state => {
      const index = state.nearbyFilters.findIndex(x => x.value === value);
      if (index === -1) {
        console.error("Couldn't find nearbyFilter", value);
        return {};
      }
      const newNearbyFilters = state.nearbyFilters.slice();
      newNearbyFilters.splice(index, 1);
      return { nearbyFilters: newNearbyFilters };
    }, this.updateMap);
  };

  removeAmenityFilter = value => {
    this.setState(state => {
      const index = state.amenityFilters.findIndex(x => x === value);
      if (index === -1) {
        console.error("Couldn't find amenity filter:", value);
        return {};
      }
      const newAmenityFilters = state.amenityFilters.slice();
      newAmenityFilters.splice(index, 1);
      return { amenityFilters: newAmenityFilters };
    }, this.updateMap);
  };

  render() {
    return (
      <div className={styles.appContainer}>
        <Modal
          isOpen={this.state.choosingDistance || this.state.editingDistance}
          onRequestClose={this.closeModal}
          contentLabel="Select distance for filter"
          style={{
            content: {
              display: "flex",
              background: "none",
              border: "none",
              justifyContent: "center"
            }
          }}
        >
          {(this.state.choosingDistance || this.state.editingDistance) && (
            <ChooseDistanceModal
              filterData={this.state.filterData}
              closeModal={this.closeModal}
              submitDistance={this.addNearbyFilter}
            />
          )}
        </Modal>
        <div className={styles.mapContainer}>
          <div className={styles.map} id="map" />
          <div className={styles.mapOverlayContainer}>
            {(this.isTooZoomedOut() && (
              <div className={styles.userNotification}>
                There is too much data at this zoom level, please zoom in closer
                for us to show you results
              </div>
            )) ||
              (this.state.hasLoadedFirstTime &&
                this.state.results.length === 0 && (
                  <div className={styles.userNotification}>
                    There are no results, try zooming out or relaxing your
                    constraints
                  </div>
                ))}
            <div className={styles.topContainer}>
              <MainInput moveMap={this.moveMap} />
              <div
                className={styles.clickThroughContainer}
                style={{ flexGrow: 1 }}
              >
                <div className={styles.formContainer}>
                  <DatePicker
                    minDate={new Date()}
                    selectsStart
                    selected={this.state.minDate && this.state.minDate.toDate()}
                    startDate={
                      this.state.minDate && this.state.minDate.toDate()
                    }
                    endDate={this.state.maxDate && this.state.maxDate.toDate()}
                    onChange={this.handleDateChangeStart}
                    placeholderText="📅 Arrival"
                    dateFormat="📅 do of MMM YYYY"
                    customInput={<input type="text" size="10" />}
                  />
                  <DatePicker
                    minDate={this.state.minDate && this.state.minDate.toDate()}
                    selectsEnd
                    selected={this.state.maxDate && this.state.maxDate.toDate()}
                    startDate={
                      this.state.minDate && this.state.minDate.toDate()
                    }
                    endDate={this.state.maxDate && this.state.maxDate.toDate()}
                    onChange={this.handleDateChangeEnd}
                    placeholderText="📅 Departure"
                    dateFormat="📅 do of MMM YYYY"
                    customInput={<input type="text" size="10" />}
                  />
                  <NumericInput
                    min={1}
                    format={x => `👥 ${x} guest${x > 1 ? "s" : ""}`}
                    parse={x => (x.match(/(\d+)/) && x.match(/(\d+)/)[1]) || 1}
                    value={this.state.numGuests}
                    onChange={this.handleGuestsChanged}
                    size={browserInfo.name === "chrome" ? 10 : 5}
                  />
                  <div className={styles.reactRange}>
                    <div className={styles.priceInterval}>
                      {this.state.minPrice}$ - {this.state.maxPrice}$
                    </div>
                    <Range
                      className={styles.reactRange}
                      min={0}
                      max={1000}
                      count={1}
                      pushable
                      value={[this.state.minPrice, this.state.maxPrice]}
                      onChange={this.handlePriceChanged}
                      marks={{
                        0: "0$",
                        250: "250$",
                        500: "500$",
                        750: "750$",
                        1000: "1000$"
                      }}
                    />
                  </div>
                  <select
                    value={this.state.roomType}
                    onChange={this.handleRoomTypeChanged}
                  >
                    <option value="message" disabled>
                      Choose Accommodation Type
                    </option>
                    <option value="">Any</option>
                    <option value="Entire home/apt">Entire Place</option>
                    <option value="Private room">Private Room</option>
                    <option value="Hotel room">Hotel Room</option>
                    <option value="Shared room">Shared Room</option>
                  </select>
                </div>
                <div className={styles.formContainer}>
                  <FormInput
                    placeholder="Which amenities do you require?"
                    data={this.state.amenities}
                    addFilter={this.addAmenityFilter}
                  />
                  <FormInput
                    placeholder="What would you like to be near?"
                    data={this.state.nearData}
                    addFilter={this.redirectToSelectDistance}
                  />
                </div>
              </div>
              <div
                className={`${styles.clickThroughContainer} ${
                  styles.loadingContainer
                }`}
              >
                {this.state.loading && <Spinner />}
              </div>
            </div>
            <button
              onClick={this.locate}
              className={styles.currentLocationButton}
            >
              <i className="fas fa-location-arrow" />
            </button>
          </div>
        </div>
        <div className={styles.sidebarContainer}>
          <div className={styles.propertiesContainer}>
            <div className={styles.propertiesHeaderContainer}>
              <h2>Results</h2>
              {/* <div className={styles.sortContainer}>
                Sort by:
                <select>
                  <option value="best fit">Best Fit</option>
                  <option value="cheapest">Cheapest</option>
                </select>
              </div> */}
            </div>
            {this.state.results.length > 0 ? (
              <div className={styles.resultsContainer}>
                {this.state.results.map(result => (
                  <PropertyResult
                    title={result.title}
                    subtitle={result.type}
                    previewUrl={result.picture}
                    listingId={result.id}
                    priceString={result.priceString}
                    key={`${result.title} ${result.latitude} ${
                      result.longitude
                    }`}
                    highlightMarker={this.highlightMarker.bind(
                      this,
                      this.markers.find(x => x.listingId === result.id)
                    )}
                    resetMarker={this.restoreMarkerOpacities}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.noResultsExplanation}>
                <span>
                  {this.state.hasLoadedFirstTime
                    ? "There were no results matching these constraints. Please try changing location or removing some of your filters to find matching properties"
                    : "Fetching available properties..."}
                </span>
              </div>
            )}
          </div>
          <div className={styles.filterSection}>
            <div className={styles.filterHeader}>
              <h2>Filters</h2>
              <button
                onClick={() =>
                  this.setState(
                    { nearbyFilters: [], amenityFilters: [] },
                    this.updateMap
                  )
                }
              >
                Clear Filters
              </button>
            </div>
            {this.state.nearbyFilters.length +
              this.state.amenityFilters.length >
            0 ? (
              <div className={styles.filtersContainer}>
                {this.state.nearbyFilters.map(x => (
                  <Filter
                    key={`nearby - ${x.value}`}
                    filterValue={x.value}
                    {...x}
                    removeFilter={this.removeNearbyFilter}
                    editFilter={this.redirectToEditDistance}
                  />
                ))}
                {this.state.amenityFilters.map(value => (
                  <Filter
                    key={`nearby - ${value}`}
                    filterValue={value}
                    removeFilter={this.removeAmenityFilter}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.noFiltersExplanation}>
                <span>
                  Select desired amenities or places and services you would like
                  to be near/far from for filters to show up here
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
