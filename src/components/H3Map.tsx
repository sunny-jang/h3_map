import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import * as h3 from 'h3-js';
import * as mapUtill from '../utils/mapUtil';
// @ts-ignore
import {Polygon, ArrayOfCoords, Map} from 'navermaps';
import axios from 'axios';
import { mapOptions, newPolygonOptions, polygonOptions } from '../constants';

type Props = {};

const H3Map = ({ }: Props) => {
    const fetcher = (url:string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data, mutate } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);
    const [map, setMap] = useState<Map>();
    const [newPolygon, setNewPolygon] = useState<Polygon>();
    const [polygon, setPolygon] = useState<Polygon>();

    useEffect(()=>{
        let map = new Map('map', mapOptions);
        setMap(map);
        setNewPolygon(new Polygon({
            map: map,
            paths: [[]],
            ...newPolygonOptions
        }));

        setPolygon(new Polygon({
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

    const drawPolygon = (polygon: Polygon, polyPath: ArrayOfCoords[]) => {
        if (polygon) polygon.setPaths(polyPath)
    }

    const removeNewPolygon = () => {
        setHexList([]);
        newPolygon && newPolygon.setMap(null);

        setNewPolygon(new Polygon({
            map: map,
            paths: [[]],
            ...newPolygonOptions
        }));
    }

    const postPolygonSet = (hexList: string[]) =>{
        removeNewPolygon();

        mutate([
            ...data,
            ...(hexList.map(hex=>{return {index: hex}}))
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