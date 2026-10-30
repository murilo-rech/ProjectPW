import HttpClientBase from "./HttpClientBase.js";
import School from "./School.js";

export default class Schools extends HttpClientBase {
    async mine() {
        const response = await this.get("/schools/mine");
        const school = Array.isArray(response?.data) ? response.data[0] : response?.data;
        if (!school || typeof school !== "object") throw new Error("A API não retornou a escola vinculada.");
        response.data = School.fromAPI(school);
        return response;
    }

    async list() {
        const response = await this.get("/schools/list");
        if (!Array.isArray(response?.data)) throw new Error("A API não retornou uma lista de escolas.");
        response.data = response.data.map((school) => School.fromAPI(school));
        return response;
    }

    async find(id) {
        const response = await this.get("/schools/list/:school_id", { school_id: id });
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API retornou uma resposta inesperada para a escola.");
        }
        response.data = School.fromAPI(response.data);
        return response;
    }

    async create(data) {
        const school = data instanceof School ? data : new School(data);
        const response = await this.post("/schools", school.toPayload());
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API não retornou a escola cadastrada.");
        }
        response.data = School.fromAPI(response.data);
        return response;
    }

    async update(id, data) {
        const school = data instanceof School ? data : new School(data);
        const response = await this.put("/schools/:school_id", school.toPayload(), { school_id: id });
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API não retornou a escola atualizada.");
        }
        response.data = School.fromAPI(response.data);
        return response;
    }

    async updateMine(data) {
        const response = await this.put("/schools/mine/update", data);
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API não retornou os dados da escola atualizados.");
        }
        response.data = School.fromAPI(response.data);
        return response;
    }

    async remove(id) {
        return this.delete("/schools/:school_id", { school_id: id });
    }
}
