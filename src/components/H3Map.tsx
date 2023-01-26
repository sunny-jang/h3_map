import React, { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import * as h3 from 'h3-js';
import * as mapUtill from '../utils/mapUtil';
import axios from 'axios';
import { mapOptions, newPolygonOptions, polygonOptions } from '../constants';

type Props = {};

function useListenerEvent(
    target: any,
    eventType: string,
    listener: any,
) {
    useEffect(() => {
        const event = target && naver.maps.Event.addListener(target, eventType, listener);

        return () => {
            naver.maps.Event.removeListener(event);
        }
    }, [target, listener])
}

const H3Map = ({ }: Props) => {
    const fetcher = (url: string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data, mutate } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);
    const [map, setMap] = useState<naver.maps.Map>();
    const [newPolygon, setNewPolygon] = useState<naver.maps.Polygon>();
    const [polygon, setPolygon] = useState<naver.maps.Polygon>();

    const addHex = (e: naver.maps.PointerEvent) => {
        const hex = mapUtill.getH3Index(e);
        let newHex = data && checkDup(data.map((item: Hex) => item.index), hexList, hex);
        if (newHex) { setHexList([...hexList, newHex]); return }
    }

    useListenerEvent(map, "click", useCallback(addHex, [hexList, data]));

    useEffect(() => {
        let map = new naver.maps.Map('map', mapOptions);
        setMap(map);
        setNewPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            ...newPolygonOptions
        }));

        setPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            ...polygonOptions
        }));

        axios.get('http://localhost:8000/api/h3').then(res => console.log(res))
    }, []);

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);
        const polyPath = mapUtill.makePolyPath(newPolyPath);

        newPolygon && newPolygon?.setPaths(polyPath);

    }, [hexList])

    useEffect(() => {
        if (data) {
            const polyPath = mapUtill.makePolyPath(mapUtill.cellMaps(data));
            polygon && drawPolygon(polygon, polyPath);
        }

    }, [data, polygon, map]);



    const drawPolygon = (polygon: naver.maps.Polygon, polyPath: naver.maps.ArrayOfCoords[]) => {
        if (polygon) polygon.setPaths(polyPath)
    }

    const removeNewPolygon = () => {
        setHexList([]);
        newPolygon && newPolygon.setMap(null);

        setNewPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            ...newPolygonOptions
        }));
    }

    const checkDup = (currentHex: string[], selectedHex: string[], hex: string) => {
        if (selectedHex.includes(hex) || currentHex.includes(hex)) {
            alert("이미 선택된 지역입니다.")
            return;
        }
        return hex;
    }

    const postPolygonSet = (hexList: string[]) => {
        removeNewPolygon();
        mutate([
            ...(hexList.map(hex => { return { index: hex } })),
            ...data,
        ], false);

        axios.post('http://localhost:8001/api/h3', {
            indexs: hexList
        })
    }

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '500px' }} />
            <button onClick={() => { postPolygonSet(hexList) }}>새로운 폴리곤 전송 버튼</button>
        </div>
    )
};

export default H3Map;