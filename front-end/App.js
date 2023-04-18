const express = require('express');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/AuthenticationRoutes');
const universityRouter = require('./routes/UniversityRoutes');
const eventRouter = require('./routes/EventRoutes');
const userRouter = require('./routes/UserRoutes');
const rsoRouter = require('./routes/RSORoutes');

const Authenticator = require('./middleware/Authenticator');


const app = express();
const port = 3000;

app.use(express.static('public/static'));

app.use(express.json());
app.use(cookieParser());

app.get('/', async (req, res) => {
    if (req.cookies.user) {
        return res.redirect('/home');
    }

    return res.sendFile(__dirname + '/public/index.html');
});

app.get('/home', Authenticator, (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
});

app.use('/users', Authenticator, userRouter);
app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/events', Authenticator, eventRouter);
app.use('/rsos', Authenticator, rsoRouter); 


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
