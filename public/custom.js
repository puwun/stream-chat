// global vairables....
let client, channel, username, activeUser;

client = new StreamChat('9kzpbkbcjqtb');

// [...]

async function generateToken(username) {
    const { token } = (await axios.get(`/token?username=${username}`)).data;
    return token;
}

async function initializeClient() {
    const token = await generateToken(username);

    await client.setUser(
        {
            id: username,
            name: 'The user name', // Update this name dynamically
            image: 'https://bit.ly/2u9Vc0r' // user image can be updated dynamically
        },
        token
    ); // token generated from our Node server
    await listUsers();
    return client;
}


const user = document.getElementById('user-login-input');

user.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        checkAuthState();
    }
});

checkAuthState();

async function checkAuthState() {
    if (!user.value) {
        document.getElementById('login-block').style.display = 'grid';
        document.getElementsByClassName('chat-container')[0].style.display = 'none';
    } else {
        username = user.value;

        await initializeClient();

        document.getElementsByClassName('chat-container')[0].style.display = 'grid';
        document.getElementById('login-block').style.display = 'none';
    }
}


function populateUsers(users) {
    // remove the current users from the list of users
    const otherUsers = users.filter(user => user.id !== username);

    const usersElement = document.getElementById('users');
    otherUsers.map(user => {
        const userElement = document.createElement('div');

        userElement.className = 'user';
        userElement.id = user.id;
        userElement.textContent = user.id;
        userElement.onclick = () => selectUserHandler(user);

        usersElement.append(userElement);
    });
}


//this code restricts user to start a new chat if he is already in a chat
// let chatInProgress = false;
async function selectUserHandler(userPayload) {
    // if (chatInProgress) {
    //     alert('You are already in a chat. Please end the current chat before starting a new one.');
    //     return;
    // }
    if (activeUser === userPayload.id) return; // current active user, so do not proceed...

    activeUser = userPayload.id;
    // chatInProgress = true;

    // remove the 'active' class from all users
    const allUsers = document.getElementsByClassName('user');
    Array.from(allUsers).forEach(user => {
        user.classList.remove('active');
    });

    // add the 'active' class to the current selected user
    const userElement = document.getElementById(userPayload.id);
    userElement.classList.add('active');

    // remove all previous messages in the message container...
    const messageContainer = document.getElementById('messages');
    messageContainer.innerHTML = '';

    // [] 
    await initializeChannel([username, userPayload.id]);
}


async function listUsers() {
    const filters = {};
    const response = await client.queryUsers(filters);

    populateUsers(response.users);
    return response;
}

async function initializeChannel(members) {
    //members => array of users, [user1, user2]
    channel = client.channel('messaging', {
        members: members,
        session: 8 // custom field, you can add as many as you want
    });

    await channel.watch();

    channel.on('message.new', event => {
        appendMessage(event.message);
      });

    channel.state.messages.forEach(message => {
    appendMessage(message);
    });
}

function appendMessage(message) {
    const messageContainer = document.getElementById('messages');

    // Create and append the message div
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user.id === username ? 'message-right' : 'message-left'
        }`;

    // Create the username div
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'message-username';
    usernameDiv.textContent = `${message.user.id}:`;

    // Append the username div to the MessageDiv
    messageDiv.append(usernameDiv);

    // Create the main message text div
    const messageTextDiv = document.createElement('div');
    messageTextDiv.textContent = message.text;

    // Append the username div to the MessageDiv
    messageDiv.append(messageTextDiv);

    // Then append the messageDiv to the "messages" div
    messageContainer.appendChild(messageDiv);
}

async function sendMessage(message) {
    return await channel.sendMessage({
      text: message
    });
  }


  const inputElement = document.getElementById('message-input');

  inputElement.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      sendMessage(inputElement.value);
      inputElement.value = '';
    }
  });