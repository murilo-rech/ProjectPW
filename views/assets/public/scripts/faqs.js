import Faqs from "../../../_common/classes/Faqs.js";

const list = document.querySelector("[data-public-faq-list]");
const faqs = new Faqs();

if (list) {
    loadFaqs();
}

async function loadFaqs() {
    const response = await faqs.listActive();
    const limit = Number(list.dataset.faqLimit || 0);
    const data = limit ? response.data.slice(0, limit) : response.data;

    list.innerHTML = "";

    data.forEach((faq, index) => {
        const item = document.createElement("article");
        item.className = "accordion-item";
        item.innerHTML = `
            <button class="accordion-trigger" type="button" aria-expanded="false" id="faq-${faq.id || index + 1}">
                ${faq.question}<em class="accordion-icon" aria-hidden="true">▾</em>
            </button>
            <section class="accordion-content" role="region" aria-labelledby="faq-${faq.id || index + 1}">
                <p>${faq.answer}</p>
            </section>`;

        const button = item.querySelector(".accordion-trigger");
        button.addEventListener("click", () => {
            const open = item.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open);
        });

        list.appendChild(item);
    });
}
