console.log("Profile script loaded");

const userLogin = JSON.parse(localStorage.getItem("userLogin"));
const formEditProfile = document.querySelector("#formEditProfile");
const formEditPhoto = document.querySelector("#formEditPhoto");
const formEditPassword = document.querySelector("#formEditPassword");

console.log(userLogin.user);
console.log(userLogin.user.photo);

const photoPreview = document.querySelector("#photoPreview");
photoPreview.src = "http://localhost:8080/acme-manha" + userLogin.user.photo;
console.log(photoPreview);

formEditProfile.addEventListener("submit",  (event) => {
    event.preventDefault();
});

formEditPhoto.addEventListener("submit",  (event) => {
    event.preventDefault();
});

formEditPassword.addEventListener("submit",  (event) => {
    event.preventDefault();
});

