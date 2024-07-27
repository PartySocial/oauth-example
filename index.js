const express = require('express');
const { default:axios } = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/login', (req, res) => {
  const authUrl = `${process.env.AUTH_SERVER}/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&state=random_state_string`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenResponse = await axios.post(`${process.env.AUTH_SERVER}/token`, null, {
      headers: {
        code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      }
    });
    const accessToken = tokenResponse.data.access_token;
    res.render('callback', { accessToken });
  } catch (error) {
    console.error(error)
    res.status(500).send('Error exchanging authorization code for access token', error);
  }
});

app.get('/user', async (req, res) => {
  const accessToken = req.query.token;
  try {
    const userResponse = await axios.get(`${process.env.AUTH_SERVER}/auth/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        client_id: process.env.CLIENT_ID
      }
    });
    res.render('user', { user: userResponse.data });
  } catch (error) {
    res.status(500).send('Error retrieving user information');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
