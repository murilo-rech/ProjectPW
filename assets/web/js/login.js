import {
    HttpUser
} from "../../_shared/js/HttpUser.js";

import {
    Toast
} from "../../_shared/js/Toast.js";

const requestUserLogin = new HttpUser();
const toast = new Toast();

console.log("API inicializada", requestUserLogin);

const formLogin = document.querySelector("#formLogin");

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginData = new FormData(formLogin);
    const headers = {
        email: loginData.get("email"),
        password: loginData.get("password")
    }

    try {
        const userLogin = await requestUserLogin.loginUser({}, headers);
        console.log(userLogin.message, userLogin.type);
        toast.show(userLogin.message, userLogin.type);
        if(userLogin.type === "success") {
            localStorage.setItem("userLogin", JSON.stringify(userLogin.data));
            setTimeout(() => {
                window.location.href = "./../../acme-manha/app";
            }, 2000);
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
    }

    /*
    try {
        fetch("http://localhost:8080/acme-manha/api/users/login", {
            method: "GET",
            headers: headers
        }).then((response) => {
            //console.log(response);
            response.json().then((userLogin) => {
                console.log(userLogin.data);
                localStorage.setItem("token", JSON.stringify(userLogin.data));
            });
        })
    } catch (error) {
       console.error("Erro ao fazer login:", error);
    }
    */
});