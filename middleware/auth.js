const jwt = require('jsonwebtoken');
const userModal = require("../models/userModel");

const auth = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;

        if (token) {
            const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);

            const findUser = await userModal.findOne({ _id: verifyUser._id });

            req.token = token;
            req.user = findUser;

            next();
        } else {
            res.redirect('/');
        }

    } catch (err) {
        res.status(401).send(err);
    }
}

module.exports = auth;