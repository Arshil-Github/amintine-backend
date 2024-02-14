const mongoose = require("mongoose")

const connectionURL = "mongodb+srv://admin:NKvalSPuz4pkffng@cluster0.7ffcbvq.mongodb.net/Valmity"

mongoose.connect(connectionURL)

let UserSchema = new mongoose.Schema({
    username: String,
    hostelNumber: Number,
    roomNumber: Number,
    bio: String,
    instaId: String,
    lastRequest: Number
})

let UserDb = mongoose.model("User", UserSchema)

let fixedUserSchema = new mongoose.Schema({
    username: String,
    hostelNumber: Number,
    roomNumber: Number,
    matchId: String
})
let fixedUserDb = mongoose.model("FixedUser", fixedUserSchema)

module.exports = {UserDb}
