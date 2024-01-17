const express = require('express');
const app = express();



// Stream Chat server SDK
const StreamChat = require('stream-chat').StreamChat;
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

const serverClient = new StreamChat('9kzpbkbcjqtb', '7vbz4r6bqcha82ekksa2k5698dd4kkhvj9b3dceser72sbe2c936eze7ykqgkha5');

//http://localhost:8800/token?username=theUserUsername passed this data in query string as we sent a get request
app.get('/token', (req, res) => {
  const { username } = req.query;
  if (username) {
    const token = serverClient.createToken(username);
    res.status(200).json({ token, status: 'sucess' });
  } else {
    res.status(401).json({ message: 'invalid request', status: 'error' });
  }
});


app.listen(8800, () => {
  console.log('Example app listening on port 8800!');
});