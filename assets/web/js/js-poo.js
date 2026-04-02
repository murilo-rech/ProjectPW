import {
    User
} from "../../_shared/js/User.js";
console.log("oi...");

const userLogin = new User(
    null,
    "Fábio Santos",
    "fabiosantos@gmail.com",
    "12345678",
    null
);

console.log(userLogin);
userLogin.formLoad(document.querySelector("#form-user-login"));