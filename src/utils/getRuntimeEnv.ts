export const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.API_URL!== '') {
    return window.__ENV__;
  }
  return {
    API_URL: process.env.API_URL || 'http://localhost:8080',
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'dit',
  };
};