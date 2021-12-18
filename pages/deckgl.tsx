import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import DeckGL, { MapController, RGBAColor } from "deck.gl";
import { GeoJsonLayer } from "@deck.gl/layers";

import { HexagonLayer, TileLayer, BitmapLayer } from "deck.gl";

const STATUS_DATA_URL = "./opendata_status.csv";
const DATA_GEOJSON = "./japan_tokyo.json";

const colorRange: RGBAColor[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

const renderLayers: any = (props: { data: any }) => {
  const { data } = props;

  const tileLayer = new TileLayer({
    data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",

    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const layers: any[] = [];

  const GeoJSONLayer = new GeoJsonLayer({
    data: DATA_GEOJSON,
    filled: true,
    stroked: true,
    getLineWidth: 30,
    getLineColor: [0, 0, 0, 100],
    getFillColor: (d: any) => {
      const statusForCode = data.filter((i: any) => {
        if (!d.properties.code) {
          return false;
        }
        return i.code === d.properties.code.toString().slice(0, -1);
      });
      if (statusForCode.length > 0) {
        const all = statusForCode[0].exists + statusForCode[0].none;
        const brightness = 255 - Math.floor(all / (3500 / 255));

        return [brightness, brightness, 255, 100];
      } else {
        return [255, 255, 255, 100];
      }
    },
  });

  return [layers, tileLayer, GeoJSONLayer];
};

const Page: NextPage = () => {
  const [data, setData] = useState({});

  // load csv data
  useEffect(() => {
    const fetchStatusData = async () => {
      const res = await fetch(STATUS_DATA_URL);
      const text = await res.text();
      const result = text.split("\n");
      const newData = result.map(function (d) {
        const row = d.split(",");
        return { code: row[1], exists: +row[2], none: +row[3] };
      });
      setData(newData);
    };

    fetchStatusData();
  }, []);

  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 139.521976,
    latitude: 35.791801,
    zoom: 10,
    maxZoom: 16,
    pitch: 30,
    bearing: 0,
  });

  //resize
  useEffect(() => {
    const handleResize = () => {
      setViewport((v) => {
        return {
          ...v,
          width: "100vw",
          height: "100vh",
        };
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      <DeckGL
        layers={renderLayers({
          data: data,
        })}
        controller={{ dragRotate: false }}
        initialViewState={viewport}
      />
      <div className="attribution">
        <a
          href="http://www.openstreetmap.org/about/"
          target="_blank"
          rel="noopener noreferrer"
        >
          © OpenStreetMap
        </a>
      </div>
    </div>
  );
};

export default Page;
