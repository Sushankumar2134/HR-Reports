// api/axios.ts
import axios from 'axios';
import { API_URL } from './api';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export default instance;