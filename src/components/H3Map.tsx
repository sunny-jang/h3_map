import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import * as h3 from 'h3-js';
import * as mapUtill from '../utils/mapUtil';
import axios from 'axios';
import { mapOptions, newPolygonOptions, polygonOptions } from '../constants';

type Props = {};

const H3Map = ({ }: Props) => {
    const fetcher = (url: string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data, mutate } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);
    const [map, setMap] = useState<naver.maps.Map>();
    const [newPolygon, setNewPolygon] = useState<naver.maps.Polygon>();
    const [polygon, setPolygon] = useState<naver.maps.Polygon>();
    const [initData, setInitData] = useState(false);

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
    }, []);

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);
        const polyPath = mapUtill.makePolyPath(newPolyPath);

        newPolygon && newPolygon?.setPaths(polyPath);

        if(map && initData) {
            let listener = naver.maps.Event.addListener(map, 'click', (e) => {
                if(addHex(e)) {
                    naver.maps.Event.removeListener(listener)
                } 
            });
        }
    }, [hexList, initData])

    useEffect(() => {
        if (data) {
            const polyPath = mapUtill.makePolyPath(mapUtill.cellMaps(data));
            polygon && drawPolygon(polygon, polyPath);

            setInitData(true);
        }
        
    }, [data, polygon]);

    const addHex = (e: naver.maps.PointerEvent) => {
        const hex = mapUtill.getH3Index(e);
        let newHex = data && checkDup(data.map((item:Hex) => item.index), hexList, hex);
        if (newHex) { setHexList([...hexList, newHex]); return true }
        else return false;
    }

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

        axios.post('http://localhost:8000/api/h3', {
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