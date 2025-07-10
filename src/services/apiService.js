const baseURL = 'http://localhost:5000/api';

export async function request(url, method, body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${baseURL}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }
  
  return await response.json();
}

export const get = (url) => request(url, 'GET');
export const post = (url, data) => request(url, 'POST', data);
export const put = (url, data) => request(url, 'PUT', data);
export const del = (url) => request(url, 'DELETE');