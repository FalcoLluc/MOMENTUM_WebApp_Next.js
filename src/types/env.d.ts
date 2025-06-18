interface RuntimeEnv {
  API_URL: string;
  MAPBOX_ACCESS_TOKEN: string; 
}

interface Window {
  __ENV__?: RuntimeEnv;
}
