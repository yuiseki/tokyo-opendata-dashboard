import type { NextPage } from "next";
import Head from "next/head";
import { useState, useCallback } from "react";
import MapGL, { Marker } from "react-map-gl";
import { PieChart } from "react-minimal-pie-chart";

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [35.6769883, 139.7588499]
      },
      properties: {
        title: 'Mapbox',
        description: 'Imperial Palace'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [35.7284377, 139.7205731]
      },
      properties: {
        title: 'Mapbox',
        description: 'Sugamo Prison'
      }
    }
  ]
};

const CustomPieChart = () => {
  return (
    <PieChart
      data={[
        { title: 'One', value: 10, color: '#E38627' },
        { title: 'Two', value: 15, color: '#C13C37' },
        { title: 'Three', value: 20, color: '#6A2135' },
      ]}
      radius={5}
      center={[5, 5]}
    />
  );
};

const Home: NextPage = () => {
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 139.52197653435175,
    latitude: 35.7918012662416,
    zoom: 10,
  });
  const onViewportChange = useCallback(async (viewport) => {
    console.log(viewport);
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
          {geojson.features.map((feature, i) => (
            <Marker key={i} latitude={feature.geometry.coordinates[0]} longitude={feature.geometry.coordinates[1]} offsetLeft={-20} offsetTop={-10}>
              <CustomPieChart />
            </Marker>
          ))}
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
