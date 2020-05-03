/*eslint-disable*/
export const showAlert = (type, message) => {
  hideAlert();
  const markup = document.createElement('div');
  markup.classList.add('alert');
  markup.classList.add(`alert--${type}`);
  markup.innerHTML = message;
  document.querySelector('body').insertAdjacentElement('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};
