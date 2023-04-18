const axios = require('axios');
const express = require('express');

const eventRouter = express.Router();

eventRouter.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/events', {
            params: {
                hostType: req.query.hostType
            },
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.post('/', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4444/events', req.body, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.get('/:eventID', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/events/' + req.params.eventID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.delete('/:eventID', async (req, res) => {
    try {
        const response = await axios.delete('http://localhost:4444/events/' + req.params.eventID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.get('/:eventID/comments', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/events/' + req.params.eventID + "/comments", {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.post('/:eventID/comments', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4444/events/' + req.params.eventID + "/comments", req.body, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.post('/:eventID/comments/:commentID', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4444/events/' + req.params.eventID + "/comments/" + req.params.commentID, req.body, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.get('/:eventID/comments/:commentID', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/events/' + req.params.eventID + "/comments/" + req.params.commentID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

eventRouter.delete('/:eventID/comments/:commentID', async (req, res) => {
    try {
        const response = await axios.delete('http://localhost:4444/events/' + req.params.eventID + "/comments/" + req.params.commentID, {
            headers: {
                "authorization": "Bearer " + req.cookies.user.accessToken.token,
            }
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});



module.exports = eventRouter;