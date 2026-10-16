import AuthGuard from "../../../_common/classes/AuthGuard.js";

const path = window.location.pathname;

if (path.includes("/views/app/")) {
    AuthGuard.protect(path.includes("professor-dashboard") ? [3] : [3, 4]);
}

if (path.includes("/views/admin/")) {
    AuthGuard.protect(path.includes("/global-") ? [1] : [2]);
}
