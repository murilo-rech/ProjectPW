class HttpClientBase {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  get(endpoint) {
    return this.request('GET', endpoint);
  }

  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  async request(method, endpoint, data = null) {
    const token = sessionStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };

    if (token) headers.Authorization = 'Bearer ' + token;

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(this.baseUrl + endpoint, options);
    const result = await response.json();

    if (!response.ok) throw new Error(result.message);
    return result;
  }
}
