export default class Notification {
    #id;
    #title;
    #message;
    #isRead;
    #createdAt;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.title = data.title ?? "";
        this.message = data.message ?? "";
        this.isRead = data.is_read ?? 0;
        this.createdAt = data.created_at ?? null;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value == null ? null : Number(value); }
    get title() { return this.#title; }
    set title(value) { this.#title = String(value ?? ""); }
    get message() { return this.#message; }
    set message(value) { this.#message = String(value ?? ""); }
    get isRead() { return this.#isRead; }
    set isRead(value) { this.#isRead = Number(value) === 1 ? 1 : 0; }
    get createdAt() { return this.#createdAt; }
    set createdAt(value) { this.#createdAt = value ?? null; }

    static fromAPI(data) { return new Notification(data); }
}
