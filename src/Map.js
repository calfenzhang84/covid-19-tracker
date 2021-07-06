import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import ChangeView from "./ChangeView";
import numeral from "numeral";

function Map({ countries, center, zoom, casesType }) {
  const casesTypeColors = {
    cases: {
      hex: "#cc1034",
      multiplier: 200,
    },
    recovered: {
      hex: "#7dd71d",
      multiplier: 200,
    },
    deaths: {
      hex: "#fb4443",
      multiplier: 800,
    },
  };

  return (
    <div className="map">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.keys(countries).map((i) => (
          <Circle
            center={[
              countries[i].countryInfo.lat,
              countries[i].countryInfo.long,
            ]}
            pathOptions={{
              color: casesTypeColors[casesType].hex,
              fillColor: casesTypeColors[casesType].hex,
            }}
            radius={
              Math.sqrt(countries[i][casesType]) *
              casesTypeColors[casesType].multiplier
            }
          >
            <Popup>
              <div className="info-container">
                <div
                  className="info-flag"
                  style={{
                    backgroundImage: `url(${countries[i].countryInfo.flag})`,
                  }}
                />
                <div className="info-name">{countries[i].country}</div>
                <div className="info-confirmed">
                  Cases: {numeral(countries[i].cases).format("0,0")}{" "}
                </div>
                <div className="info-recovered">
                  Recovered: {numeral(countries[i].recovered).format("0,0")}
                </div>
                <div className="info-deaths">
                  Deaths: {numeral(countries[i].deaths).format("0,0")}
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
