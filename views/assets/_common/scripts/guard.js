import AuthGuard from "../../../_common/classes/AuthGuard.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";

const path = window.location.pathname;
const session = new SessionStorage();

document.querySelectorAll('a[href="../public/login.html"]').forEach((link) => {
    link.addEventListener("click", () => session.clearSession());
});

if (path.includes("/views/app/")) {
    const teacherPages = ["professor-dashboard.html", "atendimentos.html", "disponibilidades.html"];
    const studentPages = ["agendar.html", "agendamentos.html"];
    const allowedTypes = teacherPages.some((page) => path.endsWith(page))
        ? [3]
        : studentPages.some((page) => path.endsWith(page))
            ? [4]
            : [3, 4];
    AuthGuard.protect(allowedTypes);
}

if (path.includes("/views/admin/")) {
    AuthGuard.protect(path.includes("/global-") ? [1] : [2]);
}
