export default class Plan {
    #id;
    #name;
    #description;
    #price;
    #maxStudents;
    #maxTeachers;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.name = data.name ?? "";
        this.description = data.description ?? "";
        this.price = data.price ?? 0;
        this.maxStudents = data.max_students ?? data.maxStudents ?? 0;
        this.maxTeachers = data.max_teachers ?? data.maxTeachers ?? 0;
        this.active = data.active ?? 1;
    }

    get id() { return this.#id; }
    set id(value) {
        if (value === null) this.#id = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#id = Number(value);
        else throw new RangeError("O ID do plano deve ser positivo.");
    }
    get name() { return this.#name; }
    set name(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O nome do plano é obrigatório.");
        this.#name = value.trim();
    }
    get description() { return this.#description; }
    set description(value) { this.#description = value == null ? "" : String(value); }
    get price() { return this.#price; }
    set price(value) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) throw new RangeError("O preço deve ser não negativo.");
        this.#price = number;
    }
    get maxStudents() { return this.#maxStudents; }
    set maxStudents(value) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0) throw new RangeError("O limite de alunos deve ser inteiro não negativo.");
        this.#maxStudents = number;
    }
    get maxTeachers() { return this.#maxTeachers; }
    set maxTeachers(value) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0) throw new RangeError("O limite de professores deve ser inteiro não negativo.");
        this.#maxTeachers = number;
    }
    get active() { return this.#active; }
    set active(value) {
        const number = Number(value);
        if (![0, 1].includes(number)) throw new RangeError("O estado deve ser 0 ou 1.");
        this.#active = number;
    }

    static fromAPI(data = {}) { return new Plan(data); }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            max_students: this.maxStudents,
            max_teachers: this.maxTeachers,
            active: this.active
        };
    }
}
