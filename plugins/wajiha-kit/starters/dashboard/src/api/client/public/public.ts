import axios from 'axios';
import { apiConfig } from '../../core/config';
import {
  handleApiResponse,
  prepareApiRequest,
  rejectApiError,
} from '../../core/interceptors';

export const publicApi = axios.create(apiConfig);

publicApi.interceptors.request.use(prepareApiRequest);
publicApi.interceptors.response.use(handleApiResponse, rejectApiError);
