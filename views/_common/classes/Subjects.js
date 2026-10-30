import HttpClientBase from "./HttpClientBase.js";
import Subject from "./Subject.js";

export default class Subjects extends HttpClientBase {
    async list() {
        const response = await this.get("/subjects/list");
        if (!Array.isArray(response?.data)) throw new Error("A API nao retornou as disciplinas.");
        response.data = response.data.map((item) => Subject.fromAPI(item));
        return response;
    }

    async create(data) {
        const subject = data instanceof Subject ? data : new Subject(data);
        return this.#withSubject(await this.post("/subjects/", subject.toPayload()));
    }

    async update(id, data) {
        const subject = data instanceof Subject ? data : new Subject(data);
        return this.#withSubject(await this.put("/subjects/:subject_id", subject.toPayload(), { subject_id: id }));
    }

    async remove(id) {
        return this.delete("/subjects/:subject_id", { subject_id: id });
    }

    #withSubject(response) {
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API retornou uma resposta inesperada para a disciplina.");
        }
        response.data = Subject.fromAPI(response.data);
        return response;
    }
}
