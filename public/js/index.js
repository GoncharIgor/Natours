/*eslint-disable*/
import { login, logout } from './login';
import { updateUserSettings } from './update-settings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

const mapElement = document.getElementById('map');
const loginForm = document.querySelector('.login-form .form');
const updateUserInfoForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const logoutButton = document.querySelector('.nav__el--logout');
const bookTourButton = document.getElementById('book-tour');

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

if (updateUserInfoForm) {
  updateUserInfoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(); // for multipart form data
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUserSettings(form, 'data');

    /* BEFORE WE HAD PHOTO
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateUserSettings({ name, email }, 'data');*/
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUserSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (bookTourButton) {
  bookTourButton.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; // converted from attribute: 'data-tour-id'
    await bookTour(tourId);
    e.target.textContent = 'Book tour now!';
  });
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) {
  showAlert('success', alertMessage, 15);
}
