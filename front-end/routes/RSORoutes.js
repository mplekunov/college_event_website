const axios = require('axios');
const express = require('express');

const rsoRouter = express.Router();

rsoRouter.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/rsos', {
            params: req.query,
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});


rsoRouter.post('/', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4444/rsos', req.body, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

rsoRouter.get('/:rsoID', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/rsos/' + req.params.rsoID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

rsoRouter.get('/:rsoID/enter', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/rsos/' + req.params.rsoID + "/enter", {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

rsoRouter.get('/:rsoID/leave', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/rsos/' + req.params.rsoID + "/leave", {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

rsoRouter.delete('/:rsoID', async (req, res) => {
    try {
        const response = await axios.delete('http://localhost:4444/rsos/' + req.params.rsoID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

module.exports = rsoRouter;