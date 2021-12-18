import type { NextPage } from "next";
import Head from "next/head";
import { useState, useCallback, useEffect, useMemo } from "react";
import MapGL, { Layer, LayerProps, Source } from "react-map-gl";

const layerStyle: LayerProps = {
  id: "my-layer",
  type: "fill",
  paint: {
    "fill-color": "#007cbf",
  },
};

const Home: NextPage = () => {
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 139.52197653435175,
    latitude: 35.7918012662416,
    zoom: 10,
  });
  const [data, setData] = useState(undefined);

  const loadData = (newData: any) => {
    setData(newData);
  };

  useEffect(() => {
    const fetcher = async () => {
      const res = await fetch("./tokyo-opendata-dashboard/japan_tokyo.json");
      const json = await res.json();
      loadData(json);
    };
    fetcher();
  }, []);

  const onViewportChange = useCallback(async (viewport) => {
    setViewport(viewport);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>東京都オープンデータダッシュボード</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="map">
        <MapGL
          {...viewport}
          mapStyle="https://raw.githubusercontent.com/geolonia/notebook/master/style.json"
          onViewportChange={onViewportChange}
        >
          {data && (
            <Source type="geojson" data={data}>
              <Layer {...layerStyle} />
            </Source>
          )}
        </MapGL>
      </div>

      <style jsx>{`
        .container,
        #map {
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;
