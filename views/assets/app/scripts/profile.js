import Users from "../../../_common/classes/Users.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const form = document.querySelector("#form-profile-edit");
const users = new Users();
const session = new SessionStorage();
const controller = createFormController(form);
let savedUser = session.getUser() || {};
const avatar = document.querySelector("[data-avatar-preview]");
const avatarInput = document.querySelector("[data-avatar-input]");
const avatarFilename = document.querySelector("[data-avatar-filename]");
let previewUrl = null;

form.querySelector('[name="name"]').value = savedUser.name || "";
form.querySelector('[name="email"]').value = savedUser.email || "";
document.querySelector(".profile-name").textContent = savedUser.name || "Meu perfil";
document.querySelectorAll(".sidebar-user-name").forEach((element) => {
  element.textContent = savedUser.name || "Minha conta";
});

avatarInput?.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    avatarInput.value = "";
    window.EduUI?.showToast("Selecione uma imagem valida de ate 5 MB.", "warning");
    return;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  avatar.src = previewUrl;
  if (avatarFilename) avatarFilename.textContent = file.name;
});

users.getPhoto().then((blob) => {
  if (avatarInput.files?.length) return;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(blob);
  avatar.src = previewUrl;
}).catch((error) => {
  if (error.status !== 404) window.EduUI?.showToast(error, "error");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = controller.read();
  const password = values["new-password"];

  if (password && password !== values["new-password-confirm"]) {
    window.EduUI?.showToast("As senhas informadas não conferem.", "warning");
    return;
  }

  const data = {};
  if (values.name.trim() !== (savedUser.name || "")) data.name = values.name.trim();
  if (values.email.trim() !== (savedUser.email || "")) data.email = values.email.trim();
  if (password) data.password = password;
  const photo = avatarInput?.files?.[0] || null;
  if (!photo && Object.keys(data).length === 0) {
    window.EduUI?.showToast("Nenhuma alteracao para salvar.", "warning");
    return;
  }

  controller.setLoading(true, "Salvando...");
  let photoUpdated = false;
  try {
    if (photo) {
      await users.uploadPhoto(photo);
      photoUpdated = true;
      avatarInput.value = "";
      if (avatarFilename) avatarFilename.textContent = "Foto atualizada";
    }

    let user = session.getUser() || {};
    let token = session.getToken();
    if (Object.keys(data).length > 0) {
      const response = await users.update(data);
      user = response.data.toJSON();
      token = response.data.token || token;
      users.setAuthToken(token);
      form.querySelector('[name="name"]').value = user.name;
      form.querySelector('[name="email"]').value = user.email;
      document.querySelector(".profile-name").textContent = user.name;
      document.querySelectorAll(".sidebar-user-name").forEach((element) => {
        element.textContent = user.name;
      });
    }

    session.saveSession(token, { ...user, has_photo: photoUpdated || user.has_photo, token });
    savedUser = session.getUser();
    window.EduUI?.showToast(photoUpdated ? "Perfil e foto atualizados com sucesso." : "Perfil atualizado com sucesso.", "success");
    form.querySelector('[name="new-password"]').value = "";
    form.querySelector('[name="new-password-confirm"]').value = "";
  } catch (error) {
    const message = photoUpdated
      ? `A foto foi atualizada. Os outros dados nao foram salvos: ${error.message}`
      : error;
    window.EduUI?.showToast(message, "error");
  } finally {
    controller.setLoading(false);
  }
});
