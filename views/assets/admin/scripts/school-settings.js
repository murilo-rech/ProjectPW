import AuthGuard from "../../../_common/classes/AuthGuard.js";
import Plans from "../../../_common/classes/Plans.js";
import Schools from "../../../_common/classes/Schools.js";
import Users from "../../../_common/classes/Users.js";

function showError(error) {
  window.EduUI?.showToast(error?.message || "Não foi possível concluir a operação.", "error");
}

async function start() {
  if (!await AuthGuard.protect([2])) return;

  const schools = new Schools();
  const users = new Users();
  const schoolForm = document.querySelector("#form-settings-school");
  const securityForm = document.querySelector("#form-settings-security");
  let school;

  if (schoolForm) {
    try {
      school = (await schools.mine()).data;
      schoolForm.elements["school-name"].value = school.name;
      schoolForm.elements["school-code"].value = school.code;
      schoolForm.elements["school-phone"].value = school.phone || "";
    } catch (error) {
      showError(error);
    }

    schoolForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!schoolForm.reportValidity()) return;
      const submit = schoolForm.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const response = await schools.updateMine({
          name: schoolForm.elements["school-name"].value.trim(),
          code: schoolForm.elements["school-code"].value.trim(),
          email: school.email,
          phone: schoolForm.elements["school-phone"].value.trim()
        });
        school = response.data;
        window.EduUI?.showToast(response.message || "Dados da escola atualizados.", "success");
      } catch (error) {
        showError(error);
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (securityForm) {
    securityForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!securityForm.reportValidity()) return;
      const currentPassword = securityForm.elements["current-password"].value;
      const newPassword = securityForm.elements["new-password"].value;
      const confirmation = securityForm.elements["new-password-confirm"].value;
      if (newPassword !== confirmation) {
        window.EduUI?.showToast("A confirmação da nova senha não confere.", "warning");
        return;
      }

      const submit = securityForm.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const response = await users.updatePassword(currentPassword, newPassword);
        window.EduUI?.showToast(response.message || "Senha alterada com sucesso.", "success");
        securityForm.reset();
      } catch (error) {
        showError(error);
      } finally {
        submit.disabled = false;
      }
    });
  }

  try {
    if (!school) school = (await schools.mine()).data;
    const plansResponse = await new Plans().listActive();
    const plan = plansResponse.data.find((item) => Number(item.id) === Number(school.planId));
    document.querySelector("[data-school-plan-name]").textContent = plan?.name || "Plano sem cadastro";
    document.querySelector("[data-school-plan-limits]").textContent = plan
      ? `Até ${plan.maxStudents} alunos / ${plan.maxTeachers} professores ativos`
      : "Os limites deste plano não estão disponíveis.";
    document.querySelector("[data-school-plan-price]").textContent = plan
      ? `R$ ${Number(plan.price).toFixed(2)}/mês`
      : "—";
  } catch (error) {
    document.querySelector("[data-school-plan-name]").textContent = "Não foi possível carregar o plano";
    document.querySelector("[data-school-plan-limits]").textContent = "";
    showError(error);
  }
}

start();
