import * as dotenv from 'dotenv';
dotenv.config();

// process.env.DB_CONNECTION_STRING = process.env.NODE_ENV === "dev" ?

if (process.env.NODE_ENV.length <= 0) {
    console.log(`Server cannot be run without NODE_ENV variable set.`);
    exit(1);
}

console.log(`Server is in ${process.env.NODE_ENV} mode.`);

import express from 'express';
import { exit } from 'process';

import Logger from './serverAPI/middleware/logger/Logger';

import { userRoute } from './serverAPI/routes/UserRoutes';
import { authenticationRoute } from './serverAPI/routes/AuthenticationRoutes';
import { rsoRoute } from './serverAPI/routes/RSORoutes';
import { eventRoute } from './serverAPI/routes/EventRoute';
import { universityRoute } from './serverAPI/routes/UniversityRoutes';

const app = express();

app.use(Logger.consoleLog);

const cors = require("cors");

var corsOptions = {
    origin: true
};

app.use(cors(corsOptions));

app.use('/users', userRoute);
app.use('/universities', universityRoute);
app.use('/auth', authenticationRoute);
app.use('/rsos', rsoRoute);
app.use('/events', eventRoute);

const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

export { app, server };
