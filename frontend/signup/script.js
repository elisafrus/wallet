const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('Error');

if (myParam) {
  document.getElementById('error').innerHTML += 'User with this email is already registered';
}
