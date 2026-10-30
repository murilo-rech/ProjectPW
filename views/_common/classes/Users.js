import HttpClientBase from "./HttpClientBase.js";
import User from "./User.js";

export default class Users extends HttpClientBase {
    async login(email, password) {
        return this.#withUser(await this.post("/users/login", { email, password }));
    }

    async loginFromForm(form) {
        const data = new FormData(form);
        return this.login(data.get("email"), data.get("password"));
    }

    async loginAdmin(email, password) {
        return this.#withUser(await this.post("/users/login-admin", { email, password }));
    }

    async loginAdminFromForm(form) {
        const data = new FormData(form);
        return this.loginAdmin(data.get("email"), data.get("password"));
    }

    async list() {
        const response = await this.get("/users/list");
        if (!Array.isArray(response?.data)) {
            throw new Error("A API retornou uma lista inesperada de usuários.");
        }
        response.data = response.data.map((user) => User.fromAPI(user));
        return response;
    }

    async find(id) {
        return this.#withUser(await this.get("/users/list/:user_id", { user_id: id }));
    }

    async findMe() {
        return this.#withUser(await this.get("/users/me"));
    }

    async register(data) {
        const user = data instanceof User ? data : new User(data);
        return this.#withUser(await this.post("/users/register", user.toPayload()));
    }

    async create(data) {
        return this.register(data);
    }

    async createAdmin(data) {
        const user = data instanceof User ? data : new User(data);
        return this.#withUser(await this.post("/users/register-admin", user.toPayload()));
    }

    async createInSchool(data) {
        const payload = {
            type_id: Number(data.type_id),
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone || null,
            registration_number: data.registration_number || null,
            specialization: data.specialization || null,
            office_room: data.office_room || null
        };
        return this.#withUser(await this.post("/users/register-school", payload));
    }

    async registerFromForm(form) {
        const data = new FormData(form);
        const user = new User({
            name: data.get("name"),
            email: data.get("email"),
            password: data.get("password"),
            type_id: data.get("profile") === "professor" ? 3 : 4,
            specialization: data.get("department") || null,
            subjects: data.get("subjects") || ""
        });

        return this.#withUser(await this.post("/users/register", {
            ...user.toPayload(),
            subjects: data.get("subjects") || "",
            school_code: data.get("school-code")
        }));
    }

    async checkAuth(typeId) {
        return this.get("/auth/:type_id", { type_id: typeId });
    }

    async update(data) {
        return this.#withUser(await this.put("/users/update", this.#profilePayload(data)));
    }

    async uploadPhoto(file) {
        const data = new FormData();
        data.append("photo", file);
        return this.#withUser(await this.post("/users/photo", data));
    }

    async getPhoto() {
        return this.getBlob("/users/photo");
    }

    async updateAdmin(data) {
        return this.#withUser(await this.put("/users/update-admin", this.#profilePayload(data)));
    }

    async updatePassword(currentPassword, newPassword) {
        return this.put("/users/password", {
            current_password: currentPassword,
            new_password: newPassword
        });
    }

    async updateById(id, data) {
        const values = data instanceof User ? data.toPayload() : data;
        const allowedFields = [
            "school_id", "type_id", "name", "email", "password", "phone",
            "registration_number", "specialization", "office_room", "active"
        ];
        const payload = Object.fromEntries(
            Object.entries(values).filter(([field, value]) => allowedFields.includes(field)
                && (field === "school_id" || (value !== null && value !== "")))
        );
        for (const field of ["id", "token", "user_id"]) delete payload[field];
        return this.#withUser(await this.put("/users/admin/:user_id", payload, { user_id: id }));
    }

    async remove(id) {
        return this.delete("/users/admin/:user_id", { user_id: id });
    }

    #profilePayload(data) {
        const user = data instanceof User ? data : null;
        const payload = user ? {
            name: user.name,
            email: user.email,
            password: user.password,
            phone: user.phone,
            registration_number: user.registrationNumber,
            specialization: user.specialization,
            office_room: user.officeRoom
        } : {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            registration_number: data.registration_number ?? data.registrationNumber,
            specialization: data.specialization,
            office_room: data.office_room ?? data.officeRoom
        };
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== null && value !== "")
        );
    }

    #withUser(response) {
        if (!response?.data || Array.isArray(response.data) || typeof response.data !== "object") {
            throw new Error("A API retornou uma resposta inesperada para o usuário.");
        }
        response.data = User.fromAPI(response.data);
        return response;
    }
}
