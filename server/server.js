const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

//app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/comments', require('./routes/comments.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/cart', require('./routes/cart.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server has been started...  http://localhost:${PORT}/`)
);
