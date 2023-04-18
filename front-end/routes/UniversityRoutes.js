const axios = require('axios');
const express = require('express');

const universityRouter = express.Router();

universityRouter.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/universities', {
            params: {
                query: req.query.query
            }
        });

        if (Array(response.data).length === 0) {
            return res.send(["No Universities found"]);
        }

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

universityRouter.get('/:universityID', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4444/universities/' + req.params.universityID);

        if (response.data === null) {
            return res.send(["No University found"]);
        }

        return res.send(response.data);
    } catch (error) {
        return res.status(400).send(error?.response?.data);
    }
});

module.exports = universityRouter;