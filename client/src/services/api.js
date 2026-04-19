// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  transformResponse: [raw => {
    // If the response is a string, strip any leading BOM
    if (typeof raw === 'string') {
      raw = raw.replace(/^\uFEFF/, '');
      try {
        return JSON.parse(raw);
      } catch {
        // if it’s not JSON, just return the cleaned string
        return raw;
      }
    }
    return raw;
  }]
});

export default API;
