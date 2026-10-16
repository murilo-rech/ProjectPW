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
}
