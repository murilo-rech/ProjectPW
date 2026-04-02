export class User {
    // Campos privados
    #id;
    #name;
    #email;
    #password;
    #photo;

    constructor (id, name, email, password, photo) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#password = password;
        this.#photo = photo;
    }

    // Getters
    getName = function () {
        return this.#name;
    }
    getEmail = function () {
        return this.#email;
    }
    getPassword = function () {
        return this.#password;
    }
    getPhoto = function () {
        return this.#photo;
    }

    // Setters
    setName = function (name) {
        this.#name = name;
    }
    setEmail = function (email) {
        this.#email = email;
    }
    setPassword = function (password) {
        this.#password = password;
    }
    setPhoto = function (photo) {
        this.#photo = photo;
    }

    login () {
        console.log("Fazer Login");
    }

    formLoad = function (form) {
        console.log(form);
        // percorrer o objeto da classe internamente
        form.name.value = this.#name;
        form.email.value = this.#email;
    }

    // buscar na API os dados do usuário logado
    getUser = function () {

    }

}