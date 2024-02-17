const mongoose = require("mongoose")

const connectionURL = "mongodb+srv://admin:NKvalSPuz4pkffng@cluster0.7ffcbvq.mongodb.net/Valmity"

mongoose.connect(connectionURL)

let UserSchema = new mongoose.Schema({
    username: String,
    hostelNumber: Number,
    roomNumber: Number,
    bio: String,
    instaId: String,
    lastRequest: Number,
    matches: [{
        matchName: String,
        matchHostel: Number
    }],
    ip: String
})

let UserDb = mongoose.model("User", UserSchema)

let fixedUserSchema = new mongoose.Schema({
    username: String,
    hostelNumber: Number,
    roomNumber: Number,
    matchId: String
})
let fixedUserDb = mongoose.model("FixedUser", fixedUserSchema)


let feedbackSchema = new mongoose.Schema({
    message: String,
    user: String
})
let feedbackDb = mongoose.model("Feedback", feedbackSchema)

let blockedIPSchema = new mongoose.Schema({
    ipAddress: String
})

let blockedIPDb = mongoose.model("BlockedIP", blockedIPSchema)

module.exports = {UserDb, feedbackDb, blockedIPDb}
