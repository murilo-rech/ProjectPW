import Users from "./Users.js";
import SessionStorage from "./SessionStorage.js";

export default class AuthGuard {
    static async protect(types) {
        const session = new SessionStorage();
        const token = session.getToken();
        const user = session.getUser();

        if (!token || !user || !types.includes(user.type_id)) {
            window.location.href = "../public/login.html";
            return;
        }

        const users = new Users();
        const response = await users.checkAuth(user.type_id);

        if (response.status !== "success") {
            session.clearSession();
            window.location.href = "../public/login.html";
        }
    }
}
