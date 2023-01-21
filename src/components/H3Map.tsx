import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import * as h3 from 'h3-js';

type Props = {};
const mapOptions = {
    center: new naver.maps.LatLng(37.544186, 127.044127),
    zoom: 11,
};
const map = new naver.maps.Map('map', mapOptions);

let polygon = new naver.maps.Polygon({
    map: map,
    paths: [[]],
    fillColor: "#ff0000",
    fillOpacity: 0.3,
    strokeColor: "#ff0000",
    strokeOpacity: 0.6,
    strokeWeight: 3,
});

const getH3Index = (e) => {
    const coord = e.coord;
    const hex = h3.latLngToCell(coord.y, coord.x, 10);
    return hex;
};

const drawPolygon = (polygon, polyPath) => {
    if (polygon) polygon.setPaths(polyPath)
}

const cellMaps = (data) => {
    const indexList = data?.map((item) => item.index);
    return h3.cellsToMultiPolygon(indexList, true);
};

const makePolyPath = (Multipolygon) => {
    const path = Multipolygon?.map(poly => {
        const innerPoly = poly[0].map((item) => {
            return new naver.maps.LatLng(item[1], item[0]);
        });

        return innerPoly;
    });
    return path;
}

const H3Map = ({ }: Props) => {
    const fetcher = (url:string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);

    const addHex = (e) => {
        const hex = getH3Index(e);
        setHexList([...hexList, hex]);
    }

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);
        const polyPath = makePolyPath(newPolyPath);
        let newPolygon = new naver.maps.Polygon({
            map: map,
            paths: [[]],
            fillColor: "#0000ff",
            fillOpacity: 0.3,
            strokeColor: "#0000ff",
            strokeOpacity: 0.6,
            strokeWeight: 3,
        });

        newPolygon.setPaths(polyPath);
        naver.maps.Event.addListener(map, 'click', addHex)
    }, [hexList])

    

    useEffect(() => {
        if (data) {
            const polyPath = makePolyPath(cellMaps(data));
            drawPolygon(polygon, polyPath);
        }

    }, [data])
    return (
        <div>
            <div>H3Map</div>
            <button>send!</button>
        </div>
    )
};

export default H3Map;