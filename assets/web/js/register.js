import {
    HttpUser
} from "../../_shared/js/HttpUser.js";



// console.log("API inicializada", api);

const formRegister = document.querySelector("#formRegister");

// const api = new HttpUser();
// http://localhost:8080/acme-tarde/api/users/add
formRegister.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userData = new FormData(formRegister);
    const userCreated = await api.createUser(userData);
    console.log(userCreated);

    /*
    fetch("http://localhost:8080/acme-tarde/api/users/add",
        {
            method: "POST",
            body: new FormData(formRegister)
        }
    ).then((respose) => {
        console.log(respose);
        respose.json().then((user) => {
            console.log(user);
        });
    });

     */


});