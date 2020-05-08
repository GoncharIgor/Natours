/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';
import '@babel/polyfill';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      // url: 'http://127.0.0.1:3000/api/v1/users/login',
      // relative url for heroku; our api and FE are on the same url
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      // location.reload(true); // forces reload from server, but not from browser cache
      //  location.reload();
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out. Please try again');
  }
};
