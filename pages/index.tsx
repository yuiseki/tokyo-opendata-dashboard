import type { NextPage } from "next";
import Head from "next/head";
import { useState, useCallback, useEffect, useMemo } from "react";
import MapGL, { Marker, Layer, LayerProps, Source, Popup } from "react-map-gl";
import { PieChart } from "react-minimal-pie-chart";

const layerFillStyle: LayerProps = {
  id: "layer-fill",
  type: "fill",
  filter: ["has", "fillColor"],
  paint: {
    "fill-color": ["get", "fillColor"],
    "fill-opacity": 0.6,
  },
};

const layerLineStyle: LayerProps = {
  id: "layer-line",
  type: "line",
  paint: {
    "line-color": "#888",
    "line-width": 2,
  },
};

const CustomPieChart = ({ data }: { data: PieChartData[] }) => {
  return <PieChart data={data} radius={5} center={[5, 5]} startAngle={270} />;
};

type PieChartData = {
  title: string;
  value: number;
  color: string;
};

type PieChartMarker = {
  code: string;
  name: string;
  longitude: number;
  latitude: number;
  data: PieChartData[];
};

type OpendataStatus = {
  code: string;
  exists: number;
  none: number;
  all: number;
};

const Home: NextPage = () => {
  const [areaData, setAreaData] = useState<PieChartMarker[]>([]);
  const [statusData, setStatusData] = useState<OpendataStatus[] | undefined>(
    undefined
  );
  const [geoJSONData, setGeoJSONData] = useState(undefined);
  const [showPieChart, setShowPieChar] = useState(true);
  const [showFillLayer, setShowFillLayer] = useState(true);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 139.52197653435175,
    latitude: 35.7918012662416,
    zoom: 10,
  });

  // load opendata status
  useEffect(() => {
    const fetchStatusData = async () => {
      const res = await fetch("/tokyo-opendata-dashboard/opendata_status.csv");
      const text = await res.text();
      const lines = text.split("\n");
      const newStatusData = lines.map((l) => {
        const row = l.split(",");
        return {
          code: row[1],
          exists: +row[2],
          none: +row[3],
          all: +row[2] + +row[3],
        };
      });
      setStatusData(newStatusData);
    };
    fetchStatusData();
  }, []);

  // load tokyo office
  useEffect(() => {
    const fetchAreaData = async () => {
      const res = await fetch("/tokyo-opendata-dashboard/tokyo_office.csv");
      const text = await res.text();
      const lines = text.split("\n");
      const newAreaData = lines.map((l) => {
        const row = l.split(",");
        const areaPieMarker: PieChartMarker = {
          code: row[0],
          name: row[1],
          longitude: +row[2],
          latitude: +row[3],
          data: [{ title: "none", value: 1, color: "#000" }],
        };
        // 市区町村ごとのオープンデータの状況をマージする
        const status = statusData?.filter((s) => {
          return s.code.slice(0, -1) === areaPieMarker.code;
        });
        if (status && status.length > 0) {
          const exists = status[0].exists;
          const none = status[0].none;
          areaPieMarker.data = [
            { title: "exists", value: exists, color: "#3D6DB6" },
            { title: "none", value: none, color: "#BB4323" },
          ];
        }
        return areaPieMarker;
      });
      setAreaData(newAreaData);
    };
    fetchAreaData();
  }, [statusData]);

  const loadGeoJSONData = (newData: any) => {
    setGeoJSONData(newData);
  };

  useEffect(() => {
    if (!statusData) {
      return;
    }
    const fetcher = async () => {
      const res = await fetch("/tokyo-opendata-dashboard/japan_tokyo.json");
      const json = await res.json();
      const jsonWithCount = {
        ...json,
        features: json.features.map((f: any) => {
          if (!f.properties.code) {
            return f;
          }
          const statusDataForCode = statusData.filter((d) => {
            return d.code === f.properties.code.toString();
          });
          if (statusDataForCode[0]) {
            const opendataCount =
              statusDataForCode[0].exists + statusDataForCode[0].none;
            f.properties.opendataCount = opendataCount;
            const alpha = opendataCount / 3000;
            //console.log(opendataCount);
            //console.log(alpha);
            f.properties.fillColor = `rgba(68, 146, 61, ${alpha})`;
          }
          return f;
        }),
      };
      loadGeoJSONData(jsonWithCount);
    };
    fetcher();
  }, [statusData]);

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
          mapStyle="https://raw.githubusercontent.com/geoloniamaps/notebook/gh-pages/style.json"
          onViewportChange={onViewportChange}
        >
          {geoJSONData && (
            <Source type="geojson" data={geoJSONData}>
              <Layer {...layerFillStyle} />
              <Layer {...layerLineStyle} />
            </Source>
          )}
          {areaData.map((office: any, i: number) => (
            <Marker
              key={i}
              latitude={office.latitude}
              longitude={office.longitude}
              offsetLeft={-10}
              offsetTop={-10}
            >
              <Popup
                latitude={office.latitude}
                longitude={office.longitude}
              ></Popup>
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
