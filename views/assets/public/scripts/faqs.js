import Faqs from "../../../_common/classes/Faqs.js";

const list = document.querySelector("[data-public-faq-list]");
const faqs = new Faqs();

if (list) {
    loadFaqs().catch((error) => {
        list.textContent = "Não foi possível carregar as perguntas.";
        window.EduUI?.showToast(error, "error");
    });
}

async function loadFaqs() {
    const response = await faqs.listActive();
    const allFaqs = response.data || [];
    const limit = Number(list.dataset.faqLimit || 0);
    const data = limit ? allFaqs.slice(0, limit) : allFaqs;

    list.innerHTML = "";

    data.forEach((faq, index) => {
        const item = document.createElement("article");
        item.className = "accordion-item";
        const button = document.createElement("button");
        button.className = "accordion-trigger";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.id = `faq-${faq.id || index + 1}`;
        button.append(document.createTextNode(faq.question));
        const icon = document.createElement("em");
        icon.className = "accordion-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "▾";
        button.appendChild(icon);
        const content = document.createElement("section");
        content.className = "accordion-content";
        content.setAttribute("role", "region");
        content.setAttribute("aria-labelledby", button.id);
        const answer = document.createElement("p");
        answer.textContent = faq.answer;
        content.appendChild(answer);

        button.addEventListener("click", () => {
            const open = item.classList.contains("is-open");
            list.querySelectorAll(".accordion-item.is-open").forEach((openItem) => {
                openItem.classList.remove("is-open");
                openItem.querySelector(".accordion-trigger")?.setAttribute("aria-expanded", "false");
            });
            if (!open) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
            }
        });

        item.append(button, content);
        list.appendChild(item);
    });
}
