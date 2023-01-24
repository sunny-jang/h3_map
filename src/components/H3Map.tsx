import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import * as h3 from 'h3-js';
// @ts-ignore
import * as mapUtill from '../utils/mapUtil.ts';
import axios from 'axios';
import 'navermaps';
// @ts-ignore
import { mapOptions, newPolygonOptions, polygonOptions } from '../constants.ts';

type Props = {};

const H3Map = ({ }: Props) => {
    const fetcher = (url:string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data, mutate } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);
    const [map, setMap] = useState<naver.maps.Map>();
    const [newPolygon, setNewPolygon] = useState<naver.maps.Polygon>();
    const [polygon, setPolygon] = useState<naver.maps.Polygon>();

    useEffect(()=>{
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
    },[]);

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);
        const polyPath = mapUtill.makePolyPath(newPolyPath);

        newPolygon && newPolygon?.setPaths(polyPath);
        map && naver.maps.Event.addListener(map, 'click', addHex)
    }, [map, hexList])
    

    useEffect(() => {
        if (data) {
            const polyPath = mapUtill.makePolyPath(mapUtill.cellMaps(data));
            polygon && drawPolygon(polygon, polyPath);
        }

    }, [data, polygon]);
    
    const addHex = (e:EventListener) => {
        const hex = mapUtill.getH3Index(e);
        setHexList([...hexList, hex]);
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

    const postPolygonSet = (hexList: string[]) =>{
        removeNewPolygon();

        mutate([
            ...(hexList.map(hex=>{return {index: hex}})),
            ...data,
        ], false);

        axios.post('http://localhost:8000/api/h3', {
            indexs: hexList
        })
    }

    return (
        <div>
            <div>H3Map</div>
            <div id="map" style={{width: '100%', height:'500px'}} />
            <button onClick={()=>{postPolygonSet(hexList)}}>send!</button>
        </div>
    )
};

export default H3Map;