const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('Error');

if (myParam) {
  document.getElementById('error').innerHTML += 'Incorrect email or password';
}
