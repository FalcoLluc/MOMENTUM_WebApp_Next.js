// Type for coordinate validation
export type ValidLatLng = [number, number];

export const isValidCoordinate = (coord: unknown): coord is ValidLatLng => {
    return (
      Array.isArray(coord) &&
      coord.length === 2 &&
      typeof coord[0] === 'number' &&
      typeof coord[1] === 'number' &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1])
    );
};