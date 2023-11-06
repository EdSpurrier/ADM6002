
const express = require('express');
const app = express();

app.use(express.static('www'));

app.listen(3003, () => {
  console.log('Server listening on port 3003');
});
