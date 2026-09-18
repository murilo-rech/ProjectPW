import Users from "../../../_common/classes/Users.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";

const form = document.querySelector("#form-login");
const message = document.querySelector("#login-mensagem");
const users = new Users();
const session = new SessionStorage();

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const access = form.querySelector('[name="access"]').value;
    const response = access === "admin"
        ? await users.loginAdminFromForm(form)
        : await users.loginFromForm(form);

    if (response.status !== "success") {
        message.textContent = response.message;
        return;
    }

    session.saveSession(response.data.token, response.data);

    if (response.data.type_id === 1) {
        window.location.href = "../admin/global-dashboard.html";
    } else if (response.data.type_id === 2) {
        window.location.href = "../admin/index.html";
    } else if (response.data.type_id === 3) {
        window.location.href = "../app/professor-dashboard.html";
    } else {
        window.location.href = "../app/index.html";
    }
});
