import * as h3 from 'h3-js';

export const mapOptions = {
    center: new naver.maps.LatLng(37.544186, 127.044127),
    zoom: 11,
};

export const getH3Index = (e) => {
    const coord = e.coord;
    const hex = h3.latLngToCell(coord.y, coord.x, 10);
    return hex;
};

export const drawPolygon = (polygon, polyPath) => {
    console.log("polygon")
    console.log(polygon)
    
    if (polygon) polygon.setPaths(polyPath)
}

export const cellMaps = (data) => {
    const indexList = data?.map((item) => item.index);
    console.log(indexList, true)
    console.log(h3.cellsToMultiPolygon(indexList, true))
    
    return h3.cellsToMultiPolygon(indexList, true);
};

export const makePolyPath = (Multipolygon) => {
    const path = Multipolygon?.map(poly => {
        const innerPoly = poly[0].map((item) => {
            return new naver.maps.LatLng(item[1], item[0]);
        });

        return innerPoly;
    });
    return path;
}
