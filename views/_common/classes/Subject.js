export default class Subject {
    #id;
    #schoolId;
    #name;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.schoolId = data.school_id ?? null;
        this.name = data.name ?? "";
        this.active = data.active ?? 1;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value == null ? null : Number(value); }
    get schoolId() { return this.#schoolId; }
    set schoolId(value) { this.#schoolId = value == null ? null : Number(value); }
    get name() { return this.#name; }
    set name(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O nome da disciplina e obrigatorio.");
        this.#name = value.trim();
    }
    get active() { return this.#active; }
    set active(value) { this.#active = Number(value) === 0 ? 0 : 1; }

    static fromAPI(data) { return new Subject(data); }
    toPayload() { return { name: this.name }; }
}
