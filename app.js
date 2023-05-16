require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectBD = require('./models/config');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const userModal = require("./models/userModel")
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

app.get("/", (req, res) => {
    res.render("Login");
});

app.get("/signup", (req, res) => {

    res.render("SignUp", { message: req.session.sigMessage });
})

app.get("/user", auth, async (req, res) => {

    if (req.user) {
        res.render("UserDetails");
    }
    else {
        res.redirect("Login");
    }

});

app.get("/logout", auth, async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter((currentELe) => {
            return currentELe.token != req.token;
        })

        res.clearCookie("jwt")
        console.log("logout Successfully");
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
        console.log("logout Successfully");
        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(401).send(err);
    }
})


app.post("/login", async (req, res) => {

    const Username = req.body.loginId;
    const password = req.body.password;

    const foundData = await userModal.findOne({ username: Username });

    if (foundData) {
        const isMatch = await bcrypt.compare(password, foundData.password);

        const token = await foundData.generateAuthToken();

        res.cookie("jwt", token, { maxAge: 10 * 60 * 1000 });  // 10min


        if (isMatch) {
            res.render('UserForm');
        } else {
            console.log("Incorrect Password");
            res.redirect("/");
        }
    } else {
        console.log("user not exists..");
    }

})

app.post("/signup", async (req, res) => {

    const newUsername = req.body.username;
    const newPassword = req.body.password;

    const newUser = new userModal({
        username: newUsername,
        password: newPassword
    })

    const foundUser = await userModal.find({ username: newUsername });


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

})


app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})