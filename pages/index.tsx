import type { NextPage } from "next";
import Head from "next/head";
import { useState, useCallback, useEffect, useMemo } from "react";
import MapGL, { Marker, Layer, LayerProps, Source } from "react-map-gl";
import { PieChart } from "react-minimal-pie-chart";

const layerStyle: LayerProps = {
  id: "my-layer",
  type: "fill",
  paint: {
    "fill-color": "#007cbf",
  },
}

const CustomPieChart = ({ data }: { data: PieChartData[] }) => {
  return (
    <PieChart
      data={data}
      radius={5}
      center={[5, 5]}
      startAngle={270}
    />
  );
};

type PieChartData = {
  title: string;
  value: number;
  color: string;
}

type PieChartMarker = {
  code: string;
  name: string;
  longitude: number;
  latitude: number;
  data: PieChartData[];
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

  const [areaData, setAreaData] = useState<PieChartMarker[]>([]);
  // load csv data
  useEffect(() => {
    const fetchAreaData = async () => {
      const res = await fetch("/tokyo-opendata-dashboard/tokyo_office.csv");
      const text = await res.text();
      const result = text.split("\n");
      const newData = result.map(function (d) {
        const row = d.split(",");
        const obj: PieChartMarker = { code: row[0], name: row[1], longitude: +row[2], latitude: +row[3], data: [] };
        // NOTE: data に市区町村ごとのデータをマージする想定
        obj.data = [
          { title: 'One', value: 10, color: '#E38627' },
          { title: 'Two', value: 15, color: '#C13C37' },
          { title: 'Three', value: 20, color: '#6A2135' },
        ];

        return obj;
      });
      setAreaData(newData);
    };

    fetchAreaData();
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
          {areaData.map((office: any, i: number) => (
            <Marker key={i} latitude={office.latitude} longitude={office.longitude} offsetLeft={-10} offsetTop={-10}>
              <CustomPieChart data={office.data} />
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
