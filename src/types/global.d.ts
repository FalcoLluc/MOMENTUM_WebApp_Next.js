declare module '@mapbox/search-js-react' {
  import * as React from 'react';
  import mapboxgl from 'mapbox-gl';
  
  interface Feature {
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      full_address?: string;
      name?: string;
      place_name?: string;
    };
  }
  
  interface RetrieveResponse {
    features: Feature[];
  }
  
  export const AddressAutofill: React.FC<{
    accessToken: string;
    children?: React.ReactNode;
    onRetrieve?: (res: RetrieveResponse) => void;
    options?: {
      country?: string;
      language?: string;
      types?: string;
    };
  }>;
  
  export const SearchBox: React.FC<{
    accessToken: string;
    onRetrieve?: (res: RetrieveResponse) => void;
    children?: React.ReactNode;
    options?: {
      country?: string;
      language?: string;
      types?: string;
    };
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
    map?: mapboxgl.Map | null;
    mapboxgl?: typeof mapboxgl;
    marker?: boolean;
  }>;
  
  export const useAddressAutofill: any; // You should also type this properly
  export const useConfirmAddress: any;  // You should also type this properly
}