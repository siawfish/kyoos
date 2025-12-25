import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
});

export default instance;