const axios = require('axios');
const express = require('express');

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/users', {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

userRouter.get('/:userID', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/users/' + req.params.userID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

userRouter.delete('/', async (req, res) => {
    try {
        const response = await axios.delete('http://localhost:4444/users', {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

module.exports = userRouter;