export default class HttpClientBase {
    #baseUrl;
    #defaultHeaders;

    constructor(baseUrl = "http://localhost/ProjectPW-main/api") {
        this.#baseUrl = baseUrl;
        this.#defaultHeaders = {
            "Content-Type": "application/json"
        };

        const token = localStorage.getItem("token");
        if (token) {
            this.setAuthToken(token);
        }
    }

    setAuthToken(token) {
        this.#defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    clearAuthToken() {
        delete this.#defaultHeaders["Authorization"];
    }

    #buildUrl(endpoint, params = {}) {
        let url = `${this.#baseUrl}${endpoint}`;

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (url.includes(`/:${key}`)) {
                url = url.replace(`:${key}`, value);
            } else {
                queryParams.append(key, value);
            }
        }

        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return url;
    }

    async #fetchWithConfig(endpoint, config, params = {}) {
        const { _isFormData, ...fetchConfig } = config;

        try {
            const url = this.#buildUrl(endpoint, params);

            const headers = { ...this.#defaultHeaders, ...fetchConfig.headers };
            if (_isFormData) {
                delete headers["Content-Type"];
            }

            const response = await fetch(url, {
                ...fetchConfig,
                headers
            });

            const contentType = response.headers.get("content-type") || "";
            const isJson = contentType.includes("application/json");
            const result = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                const message = result && typeof result === "object"
                    ? result.message
                    : result;
                const error = new Error(message || `Erro HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            if (!isJson) {
                throw new Error("A API retornou uma resposta que não está em JSON.");
            }

            if (result && typeof result === "object" && result.type === "error") {
                throw new Error(result.message || "A API retornou um erro inesperado.");
            }

            return result;
        } catch (error) {
            const requestError = new Error(error.message || "Falha ao comunicar com a API.");
            if (Number.isInteger(error.status)) requestError.status = error.status;
            throw requestError;
        }
    }

    async get(endpoint, params = {}, headers = {}) {
        return this.#fetchWithConfig(endpoint, {
            method: "GET",
            headers
        }, params);
    }

    async getBlob(endpoint, params = {}, headers = {}) {
        try {
            const response = await fetch(this.#buildUrl(endpoint, params), {
                method: "GET",
                headers: { ...this.#defaultHeaders, ...headers }
            });
            if (!response.ok) {
                const contentType = response.headers.get("content-type") || "";
                const result = contentType.includes("application/json")
                    ? await response.json()
                    : await response.text();
                const message = result && typeof result === "object" ? result.message : result;
                const error = new Error(message || `Erro HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            const blob = await response.blob();
            if (!blob.type.startsWith("image/")) {
                throw new Error("A API nao retornou uma imagem valida.");
            }
            return blob;
        } catch (error) {
            if (error.status) throw error;
            throw new Error(error.message || "Falha ao carregar a imagem.");
        }
    }

    async post(endpoint, data = {}, params = {}) {
        const isFormData = data instanceof FormData;

        return this.#fetchWithConfig(endpoint, {
            method: "POST",
            body: isFormData ? data : JSON.stringify(data),
            _isFormData: isFormData
        }, params);
    }

    async put(endpoint, data = {}, params = {}) {
        const isFormData = data instanceof FormData;

        return this.#fetchWithConfig(endpoint, {
            method: "PUT",
            body: isFormData ? data : JSON.stringify(data),
            _isFormData: isFormData
        }, params);
    }

    async delete(endpoint, params = {}) {
        return this.#fetchWithConfig(endpoint, {
            method: "DELETE"
        }, params);
    }
}
