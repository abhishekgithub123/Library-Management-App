import allowedCookies from '@/constants/allowed-cookies';
import { BASE_URL } from '@/constants/api-paths';
import axios from 'axios';
import { cookies, headers as nextHeaders } from 'next/headers';

async function doApiRequest({
  path,
  method = 'GET',
  data = null,
  headers = {},
}) {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .filter((c) => allowedCookies.includes(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const incomingHeaders = await nextHeaders();

  const finalHeaders = {
    cookie: cookieHeader,
    'user-agent': incomingHeaders.get('user-agent') || '',
    accept: 'application/json',
    ...headers,
  };

  return axios.request({
    baseURL: BASE_URL,
    url: path,
    method,
    headers: finalHeaders,
    data,
    withCredentials: true,
  });
}

/**
 * Makes a secure API call from server-side, with auto-refresh token logic.
 */
export async function serverApiFetch(path, options = {}) {
  const { method = 'GET', data = null, headers = {} } = options;

  try {
    const response = await doApiRequest({
      path,
      method,
      data,
      headers,
    });

    return {
      data: response?.data,
      status: response?.status,
      headers: response?.headers,
    };
  } catch (error) {
    const status = error?.response?.status || 500;

    return {
      data: error?.response?.data || { message: error.message },
      status,
      headers: error?.response?.headers || {},
    };
  }
}
