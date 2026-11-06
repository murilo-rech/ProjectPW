export default class Faq {
    #id;
    #question;
    #answer;
    #status;
    #sortOrder;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.question = data.question ?? "";
        this.answer = data.answer ?? "";
        this.status = data.status ?? data.active ?? 1;
        this.sortOrder = data.sort_order ?? data.sortOrder ?? null;
    }

    get id() { return this.#id; }
    set id(value) {
        if (value === null) this.#id = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#id = Number(value);
        else throw new RangeError("O ID da pergunta deve ser positivo.");
    }
    get question() { return this.#question; }
    set question(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("A pergunta é obrigatória.");
        this.#question = value.trim();
    }
    get answer() { return this.#answer; }
    set answer(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("A resposta é obrigatória.");
        this.#answer = value.trim();
    }
    get status() { return this.#status; }
    set status(value) {
        const number = Number(value);
        if (![0, 1].includes(number)) throw new RangeError("O estado deve ser 0 ou 1.");
        this.#status = number;
    }
    get sortOrder() { return this.#sortOrder; }
    set sortOrder(value) {
        if (value == null || value === "") this.#sortOrder = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#sortOrder = Number(value);
        else throw new RangeError("A ordem deve ser um número inteiro positivo.");
    }

    static fromAPI(data = {}) { return new Faq(data); }

    toPayload() {
        const payload = { question: this.question, answer: this.answer, status: this.status };
        if (this.sortOrder !== null) payload.sort_order = this.sortOrder;
        return payload;
    }

    toJSON() {
        return { id: this.id, question: this.question, answer: this.answer, status: this.status, sort_order: this.sortOrder };
    }
}
