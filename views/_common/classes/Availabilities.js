import HttpClientBase from "./HttpClientBase.js";
import Availability from "./Availability.js";

export default class Availabilities extends HttpClientBase {
    async list() {
        const response = await this.get("/availabilities/list");
        if (!Array.isArray(response?.data)) throw new Error("A API nao retornou as disponibilidades.");
        response.data = response.data.map((item) => Availability.fromAPI(item));
        return response;
    }

    async listForBooking() {
        const response = await this.get("/availabilities/booking");
        if (!Array.isArray(response?.data)) throw new Error("A API nao retornou horarios disponiveis.");
        response.data = response.data.map((item) => Availability.fromAPI(item));
        return response;
    }

    async find(id) {
        const response = await this.get("/availabilities/list/:availability_id", { availability_id: id });
        if (!response?.data || typeof response.data !== "object") throw new Error("Disponibilidade nao encontrada.");
        response.data = Availability.fromAPI(response.data);
        return response;
    }

    async create(data) {
        const availability = data instanceof Availability ? data : new Availability(data);
        const response = await this.post("/availabilities/", availability.toPayload());
        if (!response?.data || typeof response.data !== "object") throw new Error("A API nao retornou o horario cadastrado.");
        response.data = Availability.fromAPI(response.data);
        return response;
    }

    async update(id, data) {
        const availability = data instanceof Availability ? data : new Availability(data);
        const response = await this.put("/availabilities/:availability_id", availability.toPayload(), { availability_id: id });
        if (!response?.data || typeof response.data !== "object") throw new Error("A API nao retornou o horario atualizado.");
        response.data = Availability.fromAPI(response.data);
        return response;
    }

    async remove(id) {
        return this.delete("/availabilities/:availability_id", { availability_id: id });
    }
}
