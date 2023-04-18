const axios = require('axios');
const express = require('express');

const Authenticator = require('../middleware/Authenticator');

const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await axios.post('http://localhost:4444/auth/login', {
            "username": username,
            "password": password
        });

        res.cookie('user', response.data, { maxAge: response.data.refreshToken.lifespanInSeconds * 1000 });
        return res.status(response.status).send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

authRouter.post('/register', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4444/auth/register', req.body);

        return res.status(response.status).send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }

});

authRouter.get('/logout', Authenticator, async (req, res) => {
    try {
        await axios.get('http://localhost:4444/auth/logout', {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send("Logged out");
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

module.exports = authRouter;