import Users from "../../../_common/classes/Users.js";

const form = document.querySelector("#form-cadastro");
const message = document.querySelector("#cadastro-mensagem");
const users = new Users();

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await users.registerFromForm(form);

    if (response.status === "success") {
        message.textContent = "Cadastro realizado. Agora faca o login.";
        form.reset();
    } else {
        message.textContent = response.message;
    }
});
