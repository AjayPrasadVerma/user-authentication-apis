const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        requird: true,
        unique: true
    },
    password: String,
    tokens: [{
        token: {
            type: String,
            requird: true
        }
    }]
});

// generating tokens
userSchema.methods.generateAuthToken = async function () {
    try {

        console.log(this.username);

        const newToken = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: newToken });
        await this.save();
        return newToken;
    } catch (err) {
        console.log(err);
    }
}

const saltRound = 10
userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, saltRound);
    }
    next();
})

const userModal = mongoose.model("userLogin", userSchema);

module.exports = userModal;