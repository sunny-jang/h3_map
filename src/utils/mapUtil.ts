import * as h3 from 'h3-js';

export const getH3Index = (e) => {
    const coord = e.coord;
    const hex = h3.latLngToCell(coord.y, coord.x, 10);
    return hex;
};

export const cellMaps = (data) => {
    const indexList = data?.map((item) => item.index);
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
