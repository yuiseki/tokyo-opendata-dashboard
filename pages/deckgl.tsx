import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import DeckGL, { MapController, RGBAColor } from "deck.gl";
import { GeoJsonLayer } from "@deck.gl/layers";

import { HexagonLayer, TileLayer, BitmapLayer } from "deck.gl";

const DATA_URL = "./heatmap-data.csv";
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

  const layes = [
    new HexagonLayer({
      id: "hexagon-layer",
      data,
      colorRange,
      radius: 1000,
      extruded: true,
      elevationScale: 40,
      elevationRange: [0, 3000],
      getPosition: (d) => d.position,
    }),
  ];

  const GeoJSONLayer = new GeoJsonLayer({
    data: DATA_GEOJSON,
    filled: true,
    stroked: true,
    getLineWidth: 10,
    getLineColor: [255, 0, 0],
    getFillColor: () => {
      // paint red at random brightness
      const rand = Math.floor(Math.random() * 255);
      return [255, rand, rand, 255];
    }
  });

  return [layes, tileLayer, GeoJSONLayer];
};

const Page: NextPage = () => {
  const [data, setData] = useState({});

  //load data
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(DATA_URL);
      const text = await res.text();
      const result = text.split("\n");
      const points = result.map(function (d) {
        const r = d.split(",");
        return { position: [+r[0], +r[1]] };
      });
      setData(points);
    };

    fetchData();
  }, []);

  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 139.767125,
    latitude: 35.681236,
    zoom: 6,
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
