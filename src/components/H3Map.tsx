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

const H3Map = ({ }: Props) => {
    const fetcher = (url) => fetch('http://localhost:4000' + url).then(res => res.json());
    const { data } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState([]);

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);

        const polyPath = makePolyPath(newPolyPath);
        polygon.setPaths(polyPath)
    }, [hexList])

    const addHex = (e) => {
        const hex = getH3Index(e);
        setHexList([...hexList, hex]);
    }

    useEffect(() => {
        naver.maps.Event.addListener(map, 'click', addHex)
    }, [hexList])

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

    useEffect(() => {
        if (data) {
            const polyPath = makePolyPath(cellMaps(data));
            drawPolygon(polygon, polyPath);
        }

    }, [data])
    return (
        <div>H3Map</div>
    )
};

export default H3Map;