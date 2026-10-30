export default class School {
    #id;
    #planId;
    #name;
    #code;
    #email;
    #phone;
    #city;
    #state;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.planId = data.plan_id ?? data.planId ?? "";
        this.name = data.name ?? "";
        this.code = data.code ?? "";
        this.email = data.email ?? "";
        this.phone = data.phone ?? null;
        this.city = data.city ?? null;
        this.state = data.state ?? null;
        this.active = data.active ?? 1;
    }

    get id() { return this.#id; }
    set id(value) {
        if (value === null) this.#id = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#id = Number(value);
        else throw new RangeError("O ID da escola deve ser positivo.");
    }
    get planId() { return this.#planId; }
    set planId(value) {
        if (value === "") this.#planId = "";
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#planId = Number(value);
        else throw new RangeError("Selecione um plano válido.");
    }
    get name() { return this.#name; }
    set name(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O nome da escola é obrigatório.");
        this.#name = value.trim();
    }
    get code() { return this.#code; }
    set code(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O código da escola é obrigatório.");
        this.#code = value.trim();
    }
    get email() { return this.#email; }
    set email(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O e-mail da escola é obrigatório.");
        this.#email = value.trim();
    }
    get phone() { return this.#phone; }
    set phone(value) { this.#phone = value || null; }
    get city() { return this.#city; }
    set city(value) { this.#city = value || null; }
    get state() { return this.#state; }
    set state(value) { this.#state = value || null; }
    get active() { return this.#active; }
    set active(value) {
        const number = Number(value);
        if (![0, 1].includes(number)) throw new RangeError("O estado deve ser 0 ou 1.");
        this.#active = number;
    }

    static fromAPI(data = {}) { return new School(data); }

    toPayload() {
        return {
            plan_id: this.planId,
            name: this.name,
            code: this.code,
            email: this.email,
            phone: this.phone,
            city: this.city,
            state: this.state,
            active: this.active
        };
    }

    toJSON() {
        return { id: this.id, ...this.toPayload() };
    }
}
