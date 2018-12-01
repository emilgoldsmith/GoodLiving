import React, { Component } from "react";
import styles from "./App.module.scss";
import { queryAirbnb } from "../api/airbnb/airbnb-client";
import { getOSMDataWithinBoundary } from "../api/overpass/overpass-client";
import MainInput from "./MainInput";
import FormInput from "./FormInput";

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
      results: []
    };
  }

  moveMap = boundingbox => {
    const latLngBounds = [
      [boundingbox[0], boundingbox[2]],
      [boundingbox[1], boundingbox[3]]
    ];
    this.map.fitBounds(latLngBounds);
  };

  componentDidMount() {
    // L is the LeafletJS variable
    /* global L:false */
    // 'map' is the id of the div where map is going to go
    this.map = L.map("map").locate({ setView: true, maxZoom: 14 });
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

    const updateResults = locations => {
      this.markers.forEach(oldMarker => oldMarker.remove());
      this.markers = locations.map(singleLocation =>
        L.marker([singleLocation.latitude, singleLocation.longitude]).addTo(
          this.map
        )
      );
    };

    this.map.on("moveend", async event => {
      const bounds = this.map.getBounds();
      const { lng: swLong, lat: swLat } = bounds.getSouthWest();
      const { lng: neLong, lat: neLat } = bounds.getNorthEast();
      const results = await queryAirbnb(swLat, swLong, neLat, neLong);
      const restaurants = await getOSMDataWithinBoundary(
        swLat,
        swLong,
        neLat,
        neLong
      );
      console.log(restaurants);
      updateResults(results);
      this.setState({
        results: results.slice(0, 10)
      });
    });
  }

  locate = () => {
    this.map.locate({ setView: true, maxZoom: 14 });
  };

  render() {
    let x = 0;
    return (
      <div className={styles.appContainer}>
        <div className={styles.mapContainer}>
          <div className={styles.map} id="map" />
          <div className={styles.mapOverlayContainer}>
            <div className={styles.topContainer}>
              <MainInput moveMap={this.moveMap} />
              <div className={styles.formContainer}>
                {new Array(4).fill(0).map(x => (
                  <FormInput key={Math.random()} />
                ))}
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
