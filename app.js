require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectBD = require('./models/config');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const userModal = require("./models/userModel");
const addUserModel = require("./models/addUserModel");
const bcrypt = require('bcryptjs');
const auth = require("./middleware/auth");
const path = require('path');

const port = process.env.PORT || 1000;

connectBD();

const staticPath = path.join(__dirname, "./public");

app.use(cookieParser());
app.use(express.static(staticPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get("/", (req, res) => {
    res.render("Login", { message: req.session.logMsg });
});

app.get("/signup", (req, res) => {

    res.render("SignUp", { message: req.session.sigMessage });
})

app.get("/adduser", auth, async (req, res) => {

    if (req.user) {

        res.render("UserForm", { email: req.session.currentUser });
    }
    else {
        res.redirect("/");
    }

})

app.get("/user", auth, async (req, res) => {

    const userDetail = await addUserModel.findOne({ email: req.session.currentUser });

    if (req.user) {
        res.render("UserDetails", { user: userDetail });
    }
    else {
        res.redirect("/");
    }

});

app.get("/logout", auth, async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter((currentELe) => {
            return currentELe.token != req.token;
        })

        res.clearCookie("jwt")
        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(401).send(err);
    }
})
app.get("/logoutAll", auth, async (req, res) => {

    try {
        // we are alligning empty array
        req.user.tokens = [];

        res.clearCookie("jwt")
        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(401).send(err);
    }
})


app.post("/login", async (req, res) => {

    const Username = req.body.username;
    const password = req.body.password;

    try {
        const foundData = await userModal.findOne({ username: Username });

        if (foundData) {
            const isMatch = await bcrypt.compare(password, foundData.password);

            const token = await foundData.generateAuthToken();

            res.cookie("jwt", token, { maxAge: 30 * 60 * 1000 });

            if (isMatch) {
                req.session.currentUser = foundData.username;
                res.redirect("/adduser");
            } else {
                req.session.logMsg = "Incorrect Password!";
                res.redirect("/");
            }
        } else {
            req.session.logMsg = "user does not exists!";
            res.redirect("/");
        }
    } catch (err) {
        res.status(400).send(err);
    }

})


app.post("/signup", async (req, res) => {

    const newUsername = req.body.username;
    const newPassword = req.body.password;

    const newUser = new userModal({
        username: newUsername,
        password: newPassword
    })

    try {

        const foundUser = await userModal.find({ username: newUsername });

        if (foundUser.length === 0) {
            const token = await newUser.generateAuthToken();

            res.cookie("jwt", token, { expires: new Date(Date.now() + 60000), httpOnly: true }); // 60sec

            await newUser.save()
                .then(() => {
                    // console.log("Successfully added........");
                    req.session.sigMessage = "Successfully Signup please login!";
                    res.redirect("/signup");
                }).catch((err) => {
                    console.log(err);
                    res.redirect("/signup");
                })
        }
        else {
            req.session.sigMessage = "User Already Exist!";
            res.redirect("/signup");
        }

    } catch (err) {
        res.status(400).send(err);
    }

})

app.post("/api/user", async (req, res) => {

    const userDetails = new addUserModel({
        name: req.body.name,
        email: req.body.email,
        mobile_no: req.body.mobile,
        gender: req.body.gender,
        status: req.body.status,
        address: req.body.address,
        district: req.body.district,
        state: req.body.state,
        pincode: req.body.pincode,
    });

    try {
        await userDetails.save();
        res.redirect("/user");

    } catch (err) {
        res.status(400).send(err);
    }
})


app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})