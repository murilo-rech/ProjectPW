import Users from "../../../_common/classes/Users.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const form = document.querySelector("#form-login");
const message = document.querySelector("#login-mensagem");
const users = new Users();
const session = new SessionStorage();
const formController = createFormController(form);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const access = form.querySelector('[name="access"]').value;
    formController.setLoading(true, "Entrando...");
    message.textContent = "";
    try {
        const response = access === "admin"
            ? await users.loginAdminFromForm(form)
            : await users.loginFromForm(form);

        session.saveSession(response.data.token, response.data);

        if (response.data.typeId === 1) {
            window.location.href = "../admin/global-dashboard.html";
        } else if (response.data.typeId === 2) {
            window.location.href = "../admin/index.html";
        } else if (response.data.typeId === 3) {
            window.location.href = "../app/professor-dashboard.html";
        } else {
            window.location.href = "../app/index.html";
        }
    } catch (error) {
        message.textContent = error.message;
        window.EduUI?.showToast(error, "error");
    } finally {
        formController.setLoading(false);
    }
});
