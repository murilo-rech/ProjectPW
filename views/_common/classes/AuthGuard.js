import Users from "./Users.js";
import SessionStorage from "./SessionStorage.js";

export default class AuthGuard {
    static async protect(types) {
        const session = new SessionStorage();
        const token = session.getToken();
        let user;
        try {
            user = session.getUser();
        } catch {
            session.clearSession();
            window.location.href = "../public/login.html";
            return false;
        }
        const userType = Number(user?.type_id);
        const allowedTypes = types.map(Number);

        if (!token || !user || !Number.isInteger(userType) || !allowedTypes.includes(userType)) {
            window.location.href = "../public/login.html";
            return false;
        }

        const users = new Users();
        try {
            await users.checkAuth(userType);
            return true;
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                session.clearSession();
                window.location.href = "../public/login.html";
                return false;
            }
            window.EduUI?.showToast("Não foi possível validar a sessão. Tente novamente.", "error");
            return false;
        }
    }
}
