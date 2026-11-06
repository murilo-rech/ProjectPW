import Users from "../../../_common/classes/Users.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const form = document.querySelector("#form-cadastro");
const message = document.querySelector("#cadastro-mensagem");
const users = new Users();
const formController = createFormController(form);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    formController.setLoading(true, "Cadastrando...");
    message.textContent = "";
    try {
        const response = await users.registerFromForm(form);
        message.textContent = response.message || "Cadastro realizado. Agora faça o login.";
        window.EduUI?.showToast(response, "success");
        formController.clear();
    } catch (error) {
        message.textContent = error.message;
        window.EduUI?.showToast(error, "error");
    } finally {
        formController.setLoading(false);
    }
});
