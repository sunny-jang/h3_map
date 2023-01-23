import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import * as h3 from 'h3-js';
import * as mapUtill from '../utils/mapUtil.ts';
import axios from 'axios';

const mapOptions = {
    center: new window.naver.maps.LatLng(37.544186, 127.044127),
    zoom: 11,
};

type Props = {};
const H3Map = ({ }: Props) => {
    const fetcher = (url:string) => fetch('http://localhost:8000' + url).then(res => res.json());
    const { data } = useSWR('/api/h3', fetcher);
    const [hexList, setHexList] = useState<string[]>([]);
    const [map, setMap] = useState(null);
    const [newPolygon, setNewPolygon] = useState(null);
    const [polygon, setPolygon] = useState(null);
    
    const addHex = (e) => {
        const hex = mapUtill.getH3Index(e);
        setHexList([...hexList, hex]);
    }

    useEffect(() => {
        let newPolyPath = h3.cellsToMultiPolygon(hexList, true);
        const polyPath = mapUtill.makePolyPath(newPolyPath);

        newPolygon && newPolygon?.setPaths(polyPath);
        map && naver.maps.Event.addListener(map, 'click', addHex)
    }, [map, hexList])
    

    useEffect(() => {
        if (data) {
            const polyPath = mapUtill.makePolyPath(mapUtill.cellMaps(data));
            mapUtill.drawPolygon(polygon, polyPath);
        }

    }, [data, polygon]);

    const postPolygonSet = (hexList) =>{
        const data = {
            indexs: hexList
        }
        setHexList([]);
        newPolygon.setMap(null)
        setNewPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            fillColor: "#0000ff",
            fillOpacity: 0.3,
            strokeColor: "#0000ff",
            strokeOpacity: 0.6,
            strokeWeight: 3,
        }));

        mutate('http://localhost:8000/api/h3')
        axios.post('http://localhost:8000/api/h3', {
            indexs: hexList
        })
    }

    useEffect(()=>{
        let map = new naver.maps.Map('map', mapOptions);
          setMap(map);
          setNewPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            fillColor: "#0000ff",
            fillOpacity: 0.3,
            strokeColor: "#0000ff",
            strokeOpacity: 0.6,
            strokeWeight: 3,
        }));

        setPolygon(new naver.maps.Polygon({
            map: map,
            paths: [[]],
            fillColor: "#ff0000",
            fillOpacity: 0.3,
            strokeColor: "#ff0000",
            strokeOpacity: 0.6,
            strokeWeight: 3,
        }));
    },[]);

    return (
        <div>
            <div>H3Map</div>
            <div id="map" style={{width: '100%', height:'500px'}} />
            <button onClick={()=>{postPolygonSet(hexList)}}>send!</button>
        </div>
    )
};

export default H3Map;