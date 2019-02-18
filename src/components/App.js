import React, { Component } from "react";
import styles from "./App.module.scss";
import { queryAirbnb } from "../api/airbnb/airbnb-client";
import { getOSMDataWithinBoundary } from "../api/overpass/overpass-client";
import MainInput from "./MainInput";
import FormInput from "./FormInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import * as NumericInput from "react-numeric-input";
// Overwriting default styles of NumericInput
NumericInput.style.input = {};
NumericInput.style["input:not(.form-control)"] = {};

const Filter = ({ iconType }) => {
  let icon, description;
  switch (iconType) {
    case "gym":
      icon = (
        <div className={`${styles.iconContainer} ${styles.gymIcon}`}>
          <i className="fas fa-dumbbell" />
        </div>
      );
      description = (
        <span>
          Gym Within <input type="number" defaultValue={500} />m
        </span>
      );
      break;

    default:
      throw new Error("Invalid iconType");
  }

  return (
    <div className={styles.filter}>
      {icon}
      {description}
      <div className={styles.growingFlex}>
        <button className={styles.unstyledButton}>
          <i className="fas fa-times" />
        </button>
      </div>
    </div>
  );
};

const PropertyResult = ({ previewUrl, title, subtitle, attributes }) => {
  let x = 0;
  return (
    <div className={styles.propertyResult}>
      <div className={styles.propertyAttributesContainer}>
        <h1>Attributes</h1>
        {attributes.map(singleAttribute => (
          <Filter iconType="gym" key={x++} />
        ))}
      </div>
      <div className={styles.leftHandSide}>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        <img src={previewUrl} alt="property preview" />
      </div>
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      restaurants: [],
      minDate: null,
      maxDate: null,
      numGuests: 1,
      minPrice: "",
      maxPrice: ""
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

  updateResults = locations => {
    this.markers.forEach(oldMarker => oldMarker.remove());
    this.markers = locations.map(singleLocation =>
      L.marker([singleLocation.latitude, singleLocation.longitude]).addTo(
        this.map
      )
    );
  };

  updateMap = async event => {
    const bounds = this.map.getBounds();
    const { lng: swLong, lat: swLat } = bounds.getSouthWest();
    const { lng: neLong, lat: neLat } = bounds.getNorthEast();
    const [results, restaurants] = await Promise.all([
      queryAirbnb(
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
          : ""
      ),
      getOSMDataWithinBoundary(swLat, swLong, neLat, neLong)
    ]);
    this.updateResults(results);
    this.setState({
      results: results.slice(0, 10),
      restaurants: restaurants
        .map(x => x.properties["name:en"] || x.properties.name)
        .filter(x => x)
    });
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
    this.updateMap();
    this.setState({ minDate: moment(newStart) });
    if (moment(newStart).isAfter(this.state.endDate)) {
      this.setState({ maxDate: moment(newStart) });
    }
  };

  handleDateChangeEnd = newEnd =>
    this.updateMap() && this.setState({ maxDate: moment(newEnd) });

  handleGuestsChanged = numGuests => this.setState({ numGuests });

  handleMinPriceChanged = minPrice => this.setState({ minPrice });

  handleMaxPriceChanged = maxPrice => this.setState({ maxPrice });

  render() {
    let x = 0;
    return (
      <div className={styles.appContainer}>
        <div className={styles.mapContainer}>
          <div className={styles.map} id="map" />
          <div className={styles.mapOverlayContainer}>
            <div className={styles.topContainer}>
              <MainInput moveMap={this.moveMap} />
              <div className={styles.clickThroughContainer}>
                <div onChange={this.updateMap} className={styles.formContainer}>
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
                    size="5"
                  />
                  <NumericInput
                    min={0}
                    step={10}
                    format={x => `${x}$`}
                    value={this.state.minPrice}
                    onChange={this.handleMinPriceChanged}
                    size="5"
                    placeholder="Min Price"
                  />
                  <NumericInput
                    min={0}
                    step={10}
                    format={x => `${x}$`}
                    value={this.state.maxPrice}
                    onChange={this.handleMaxPriceChanged}
                    size="5"
                    placeholder="Max Price"
                  />
                  <select defaultValue="">
                    <option value="" disabled>
                      Choose Accommodation Type
                    </option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                  </select>
                </div>
                <div className={styles.formContainer}>
                  <FormInput
                    placeholder="Which restaurant do you like?"
                    data={this.state.restaurants}
                  />
                  <FormInput
                    placeholder="Dummy for testing"
                    data={["abc", "def", "absafdsa", "dummy1", "dummy2"]}
                  />
                </div>
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
              <div className={styles.sortContainer}>
                Sort by:
                <select>
                  <option value="best fit">Best Fit</option>
                  <option value="cheapest">Cheapest</option>
                </select>
              </div>
            </div>
            {this.state.results.map(result => (
              <PropertyResult
                title={result.title}
                subtitle={result.type}
                previewUrl={result.picture}
                key={`${result.title} ${result.latitude} ${result.longitude}`}
                attributes={Array(3).fill(0)}
              />
            ))}
          </div>
          <div className={styles.filterSection}>
            <h2>Filters</h2>
            <div className={styles.filtersContainer}>
              {new Array(8).fill(0).map(_i => (
                <Filter iconType="gym" key={x++} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
