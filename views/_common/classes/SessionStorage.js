export default class SessionStorage {
    saveSession(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    getToken() {
        return localStorage.getItem("token");
    }

    getUser() {
        return JSON.parse(localStorage.getItem("user"));
    }

    clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}
