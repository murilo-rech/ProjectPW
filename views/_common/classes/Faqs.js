import HttpClientBase from "./HttpClientBase.js";

export default class Faqs extends HttpClientBase {
    async listActive() {
        return this.get("/faqs/active");
    }

    async listAll() {
        return this.get("/faqs/list");
    }

    async listById(id) {
        return this.get("/faqs/list/:id", { id });
    }

    async insert(data) {
        return this.post("/faqs", data);
    }

    async update(id, data) {
        return this.put("/faqs/:id", data, { id });
    }

    async remove(id) {
        return this.delete("/faqs/:id", { id });
    }
}
