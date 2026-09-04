/**
 * HttpClientBase.js
 * Classe base para requisições HTTP — será utilizada na integração com a API.
 * TODO: implementar chamadas reais quando o backend estiver disponível.
 */

class HttpClientBase {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Realiza uma requisição GET.
   * @param {string} endpoint
   * @param {Object} headers adicionais
   * @returns {Promise}
   */
  get(endpoint, headers = {}) {
    return this._request('GET', endpoint, null, headers);
  }

  /**
   * Realiza uma requisição POST.
   * @param {string} endpoint
   * @param {Object} body
   * @param {Object} headers adicionais
   * @returns {Promise}
   */
  post(endpoint, body = {}, headers = {}) {
    return this._request('POST', endpoint, body, headers);
  }

  /**
   * Realiza uma requisição PUT.
   * @param {string} endpoint
   * @param {Object} body
   * @param {Object} headers adicionais
   * @returns {Promise}
   */
  put(endpoint, body = {}, headers = {}) {
    return this._request('PUT', endpoint, body, headers);
  }

  /**
   * Realiza uma requisição DELETE.
   * @param {string} endpoint
   * @param {Object} headers adicionais
   * @returns {Promise}
   */
  delete(endpoint, headers = {}) {
    return this._request('DELETE', endpoint, null, headers);
  }

  /**
   * Método interno para montar e executar a requisição.
   */
  async _request(method, endpoint, body = null, extraHeaders = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = sessionStorage.getItem('token');
    const options = {
      method,
      headers: { ...this.defaultHeaders, ...extraHeaders },
    };

    if (token && !options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[HttpClientBase] Erro em ${method} ${url}:`, error.message);
      throw error;
    }
  }
}
