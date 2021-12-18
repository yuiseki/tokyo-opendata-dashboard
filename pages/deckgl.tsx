import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import DeckGL, { MapController } from "deck.gl";

import { HexagonLayer, TileLayer, BitmapLayer } from "deck.gl";

const DATA_URL = "./heatmap-data.csv";

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

const renderLayers = (props) => {
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

  return [layes, tileLayer];
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
    longitude: -3.2943888952729092,
    latitude: 53.63605986631115,
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
        controller={{ type: MapController, dragRotate: false }}
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
