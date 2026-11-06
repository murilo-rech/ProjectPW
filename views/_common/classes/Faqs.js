import HttpClientBase from "./HttpClientBase.js";
import Faq from "./Faq.js";

export default class Faqs extends HttpClientBase {
    async listActive() { return this.#mapFaqs(await this.get("/faqs/active")); }
    async list() { return this.#mapFaqs(await this.get("/faqs/list")); }
    async listAll() { return this.list(); }

    async find(id) {
        const response = await this.get("/faqs/list/:faq_id", { faq_id: id });
        return this.#mapOne(response);
    }

    async listById(id) { return this.find(id); }

    async create(data) {
        return this.#mapOne(await this.post("/faqs", this.#payload(data)));
    }

    async insert(data) { return this.create(data); }

    async update(id, data) {
        return this.#mapOne(await this.put("/faqs/:faq_id", this.#payload(data), { faq_id: id }));
    }

    async remove(id) { return this.delete("/faqs/:faq_id", { faq_id: id }); }

    async updateStatus(id, status) {
        return this.put("/faqs/:faq_id/status", { status }, { faq_id: id });
    }

    async updateOrder(id, sortOrder) {
        return this.put("/faqs/:faq_id/order", { sort_order: sortOrder }, { faq_id: id });
    }

    #payload(data) {
        const faq = data instanceof Faq ? data : new Faq(data);
        return faq.toPayload();
    }

    #mapOne(response) {
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API retornou uma resposta inesperada para o FAQ.");
        }
        response.data = Faq.fromAPI(response.data);
        return response;
    }

    #mapFaqs(response) {
        if (!Array.isArray(response?.data)) throw new Error("A API não retornou uma lista de FAQs.");
        response.data = response.data.map((faq) => Faq.fromAPI(faq));
        return response;
    }
}
