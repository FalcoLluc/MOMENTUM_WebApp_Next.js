interface RuntimeEnv {
  API_URL: string;
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: string; 
}

interface Window {
  __ENV__?: RuntimeEnv;
}
