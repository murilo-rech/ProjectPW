import HttpClientBase from "./HttpClientBase.js";
import Plan from "./Plan.js";

export default class Plans extends HttpClientBase {
    async list() {
        const response = await this.get("/plans/list");
        if (!Array.isArray(response?.data)) throw new Error("A API não retornou uma lista de planos.");
        response.data = response.data.map((plan) => Plan.fromAPI(plan));
        return response;
    }

    async listActive() {
        const response = await this.get("/plans/active");
        if (!Array.isArray(response?.data)) throw new Error("A API não retornou uma lista de planos.");
        response.data = response.data.map((plan) => Plan.fromAPI(plan));
        return response;
    }

    async create(data) {
        const plan = data instanceof Plan ? data : new Plan(data);
        return this.#withPlan(await this.post("/plans", plan.toJSON()));
    }

    async update(id, data) {
        const plan = data instanceof Plan ? data : new Plan(data);
        const payload = plan.toJSON();
        delete payload.id;
        return this.#withPlan(await this.put("/plans/:plan_id", payload, { plan_id: id }));
    }

    async remove(id) {
        return this.delete("/plans/:plan_id", { plan_id: id });
    }

    #withPlan(response) {
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API não retornou um plano válido.");
        }
        response.data = Plan.fromAPI(response.data);
        return response;
    }
}
