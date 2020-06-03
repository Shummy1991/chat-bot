const socket = io('http://35.157.80.184:8080');

const $form = document.getElementsByTagName('form')[0];
const $messages = document.getElementsByClassName('messages')[0];
const $usernameMeasure = document.getElementsByClassName('username-measure')[0];
const $input = document.getElementsByClassName('message-input')[0].getElementsByTagName('input')[0];
const $username = document.getElementsByClassName('username')[0].getElementsByTagName('input')[0];

let lastMessager = null;
let messageInARow = 0;

function updateUsername() {
  $usernameMeasure.innerHTML = $username.value;
  $username.style.width = `${$usernameMeasure.getBoundingClientRect().width}px`;
  localStorage.setItem("username", $username.value);
}

if (localStorage.getItem("username")) {
  $username.value = localStorage.getItem("username");
}

setTimeout(function() {
  updateUsername();
}, 50);

function scrollToBottom() {
  window.scrollTo(
    0,
    Math.max(
      0,
      $messages.getBoundingClientRect().height - (window.innerHeight - 66 - 16),
    ),
  );
}

socket.on('connect', function() {
  console.log('connected');

  socket.on('message', function({ user, message }) {
    const isSelfMessage = user === $username.value;
    $messages.insertAdjacentHTML('beforeend', `
      <div class="message-wrapper ${isSelfMessage ? 'self-message' : 'bot-message'}">
        <div class="message
          ${lastMessager === user ? ' message-continuing' : ''}
          ${lastMessager === user && messageInARow % 2 === 0 ? ' message-variant' : ''}"
        >
        ${!isSelfMessage ? `<b>${user}</b>: `: ''}${message}
      </div>
    `);
    if (lastMessager === user) {
      messageInARow++;
    } else {
      messageInARow = 0;
    }
    lastMessager = user;
    scrollToBottom();
  });

  $form.addEventListener('submit', function(event) {
    event.preventDefault();
    const { value: message } = $input;
    if (!message) return;
    const { value: user } = $username;
    socket.emit('message', { message, user: user || 'Guest' });
    $input.value = '';
  });

  $username.addEventListener('input', updateUsername);
});
