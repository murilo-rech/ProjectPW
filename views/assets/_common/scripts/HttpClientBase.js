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
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };

    if (token) headers.Authorization = 'Bearer ' + token;

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    let response;
    try {
      response = await fetch(this.baseUrl + endpoint, options);
    } catch (error) {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    }
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error('A API retornou uma resposta que não está em JSON.');
    }

    if (!response.ok || result?.type === 'error') {
      throw new Error(result?.message || `Erro HTTP ${response.status}.`);
    }
    return result;
  }
}
