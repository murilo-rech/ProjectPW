import HttpClientBase from "./HttpClientBase.js";
import Appointment from "./Appointment.js";

export default class Appointments extends HttpClientBase {
    async list() {
        const response = await this.get("/appointments/list");
        if (!Array.isArray(response?.data)) throw new Error("A API nao retornou os agendamentos.");
        response.data = response.data.map((item) => Appointment.fromAPI(item));
        return response;
    }

    async find(id) {
        const response = await this.get("/appointments/list/:appointment_id", { appointment_id: id });
        if (!response?.data || typeof response.data !== "object") throw new Error("Agendamento nao encontrado.");
        response.data = Appointment.fromAPI(response.data);
        return response;
    }

    async create(data) {
        const appointment = data instanceof Appointment ? data : new Appointment(data);
        const response = await this.post("/appointments/", appointment.toPayload());
        if (!response?.data || typeof response.data !== "object") throw new Error("A API nao retornou o agendamento criado.");
        response.data = Appointment.fromAPI(response.data);
        return response;
    }

    async update(id, data) {
        const appointment = data instanceof Appointment ? data : new Appointment(data);
        const response = await this.put("/appointments/:appointment_id", appointment.toPayload(), { appointment_id: id });
        if (!response?.data || typeof response.data !== "object") throw new Error("A API nao retornou o agendamento atualizado.");
        response.data = Appointment.fromAPI(response.data);
        return response;
    }

    async updateStatus(id, status) {
        const response = await this.put("/appointments/:appointment_id/status", { status }, { appointment_id: id });
        if (!response?.data || typeof response.data !== "object") throw new Error("A API nao retornou o status atualizado.");
        response.data = Appointment.fromAPI(response.data);
        return response;
    }

    async remove(id) {
        return this.delete("/appointments/:appointment_id", { appointment_id: id });
    }

    async listImages(id) {
        const response = await this.get("/appointments/:appointment_id/images", { appointment_id: id });
        if (!Array.isArray(response?.data)) throw new Error("A API nao retornou as imagens do agendamento.");
        return response;
    }

    async uploadImages(id, files) {
        const formData = new FormData();
        for (const file of files) formData.append("images[]", file);
        const response = await this.post("/appointments/:appointment_id/images", formData, { appointment_id: id });
        if (!Array.isArray(response?.data)) throw new Error("A API nao confirmou as imagens enviadas.");
        return response;
    }

    async getImage(id) {
        return this.getBlob("/appointments/images/:image_id", { image_id: id });
    }
}
