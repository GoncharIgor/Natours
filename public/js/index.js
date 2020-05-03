/*eslint-disable*/
import { login, logout } from './login';
import { displayMap } from './mapbox';

const mapElement = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.nav__el--logout');

if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    event.preventDefault();
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
