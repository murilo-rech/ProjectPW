import HttpClientBase from './HttpClientBase.js';

export class HttpUser extends HttpClientBase {
    constructor() {
        super(`http://localhost:8080/acme-manha/api/users`);
    }

    async createUser(userData) {
        return this.post('/add', userData);
    }

    async loginUser(loginData = {}, headers = {}) {
        return this.get('/login', loginData, headers);
    }

}