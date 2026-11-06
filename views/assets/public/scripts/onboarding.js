import Schools from "../../../_common/classes/Schools.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const form = document.querySelector("#onboarding-form");
const message = document.querySelector("#onboarding-message");
const schools = new Schools();

if (form && message) {
    const controller = createFormController(form);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const values = controller.read();
        message.textContent = "";
        if (values["admin-password"] !== values["admin-password-confirm"]) {
            const error = new Error("As senhas informadas não conferem.");
            message.textContent = error.message;
            window.EduUI?.showToast(error, "warning");
            return;
        }

        controller.setLoading(true, "Criando escola...");
        try {
            const response = await schools.register({
                plan: values["selected-plan"],
                school: {
                    name: values["school-name"],
                    code: values["school-code"],
                    cnpj: values["school-cnpj"],
                    phone: values["school-phone"]
                },
                admin: {
                    name: values["admin-name"],
                    email: values["admin-email"],
                    password: values["admin-password"],
                    password_confirm: values["admin-password-confirm"]
                }
            });

            message.textContent = `${response.message} Faça login com as credenciais do administrador.`;
            window.EduUI?.showToast(response, "success");
            form.reset();

            const loginUrl = new URL("login.html", window.location.href);
            loginUrl.searchParams.set("access", "admin");
            loginUrl.searchParams.set("email", response.data.admin.email);
            window.setTimeout(() => {
                window.location.href = loginUrl.href;
            }, 1800);
        } catch (error) {
            message.textContent = error.message || "Não foi possível cadastrar a escola. Confira os dados e tente novamente.";
            window.EduUI?.showToast(error, "error");
        } finally {
            controller.setLoading(false);
        }
    });
}
