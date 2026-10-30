export default class User {
    #id;
    #schoolId;
    #typeId;
    #name;
    #email;
    #password;
    #phone;
    #photo;
    #registrationNumber;
    #specialization;
    #officeRoom;
    #active;
    #token;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.schoolId = data.school_id ?? null;
        this.typeId = data.type_id ?? null;
        this.name = data.name ?? "";
        this.email = data.email ?? "";
        this.password = data.password ?? "";
        this.phone = data.phone ?? null;
        this.photo = data.photo ?? null;
        this.registrationNumber = data.registration_number ?? null;
        this.specialization = data.specialization ?? null;
        this.officeRoom = data.office_room ?? null;
        this.active = data.active ?? 1;
        this.token = data.token ?? null;
    }

    get id() { return this.#id; }
    set id(value) {
        if (value === null) this.#id = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#id = Number(value);
        else throw new RangeError("O ID do usuário deve ser positivo.");
    }
    get schoolId() { return this.#schoolId; }
    set schoolId(value) {
        if (value === null) this.#schoolId = null;
        else if (Number.isInteger(Number(value)) && Number(value) > 0) this.#schoolId = Number(value);
        else throw new RangeError("O ID da escola deve ser positivo.");
    }
    get typeId() { return this.#typeId; }
    set typeId(value) {
        const number = Number(value);
        if (value == null) this.#typeId = null;
        else if ([1, 2, 3, 4].includes(number)) this.#typeId = number;
        else throw new RangeError("O tipo de usuário deve estar entre 1 e 4.");
    }
    get name() { return this.#name; }
    set name(value) {
        if (typeof value !== "string" || !value.trim()) throw new TypeError("O nome é obrigatório.");
        this.#name = value.trim();
    }
    get email() { return this.#email; }
    set email(value) {
        if (typeof value !== "string" || !/^\S+@\S+\.\S+$/.test(value.trim())) {
            throw new TypeError("Informe um e-mail válido.");
        }
        this.#email = value.trim();
    }
    get password() { return this.#password; }
    set password(value) { this.#password = value == null ? "" : String(value); }
    get phone() { return this.#phone; }
    set phone(value) { this.#phone = value || null; }
    get photo() { return this.#photo; }
    set photo(value) { this.#photo = value || null; }
    get registrationNumber() { return this.#registrationNumber; }
    set registrationNumber(value) { this.#registrationNumber = value || null; }
    get specialization() { return this.#specialization; }
    set specialization(value) { this.#specialization = value || null; }
    get officeRoom() { return this.#officeRoom; }
    set officeRoom(value) { this.#officeRoom = value || null; }
    get active() { return this.#active; }
    set active(value) {
        const number = Number(value);
        if (![0, 1].includes(number)) throw new RangeError("O estado deve ser 0 ou 1.");
        this.#active = number;
    }
    get token() { return this.#token; }
    set token(value) { this.#token = value || null; }

    static fromAPI(data = {}) {
        return new User(data);
    }

    toPayload() {
        return {
            school_id: this.schoolId,
            type_id: this.typeId,
            name: this.name,
            email: this.email,
            password: this.password,
            phone: this.phone,
            photo: this.photo,
            registration_number: this.registrationNumber,
            specialization: this.specialization,
            office_room: this.officeRoom,
            active: this.active
        };
    }

    toJSON() {
        return {
            id: this.id,
            school_id: this.schoolId,
            type_id: this.typeId,
            name: this.name,
            email: this.email,
            phone: this.phone,
            photo: this.photo,
            registration_number: this.registrationNumber,
            specialization: this.specialization,
            office_room: this.officeRoom,
            active: this.active,
            token: this.token
        };
    }
}
