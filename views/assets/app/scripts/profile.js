import Users from "../../../_common/classes/Users.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const form = document.querySelector("#form-profile-edit");
const users = new Users();
const session = new SessionStorage();
const controller = createFormController(form);
const savedUser = session.getUser() || {};

form.querySelector('[name="name"]').value = savedUser.name || "";
form.querySelector('[name="email"]').value = savedUser.email || "";
document.querySelector(".profile-name").textContent = savedUser.name || "Meu perfil";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = controller.read();
  const password = values["new-password"];

  if (password && password !== values["new-password-confirm"]) {
    window.EduUI?.showToast("As senhas informadas não conferem.", "warning");
    return;
  }

  const data = { name: values.name, email: values.email };
  if (password) data.password = password;

  controller.setLoading(true, "Salvando...");
  try {
    const response = await users.update(data);
    const token = session.getToken();
    session.saveSession(token, { ...response.data.toJSON(), token });
    document.querySelector(".profile-name").textContent = response.data.name;
    window.EduUI?.showToast(response, "success");
    form.querySelector('[name="new-password"]').value = "";
    form.querySelector('[name="new-password-confirm"]').value = "";
  } catch (error) {
    window.EduUI?.showToast(error, "error");
  } finally {
    controller.setLoading(false);
  }
});
