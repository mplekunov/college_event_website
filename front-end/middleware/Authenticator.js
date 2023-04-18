const axios = require('axios');

const Authenticator = async (req, res, next) => {
    if (req.cookies.user) {
        try {
            const response = await axios.get('http://localhost:4444/users', {
                headers: {
                    "authorization": "Bearer " + req.cookies.user.accessToken.token,
                }
            });

            if (response.status === 200) {
                // res.cookie('user', response.data, { maxAge: response.data.refreshToken.lifespanInSeconds * 1000 });
                return next();
            } else {
                response = await axios.post('http://localhost:4444/auth/refreshJWT', {
                    "refreshToken": req.cookies.user.refreshToken.token
                });

                if (response.status === 200) {
                    res.cookie('user', response.data, { maxAge: response.data.refreshToken.lifespanInSeconds * 1000 });
                    return next();
                }
            }
        } catch (error) {
            console.log(error?.response?.data);
        }
    }

    res.clearCookie('user');
    return res.redirect('/');
}

module.exports = Authenticator;