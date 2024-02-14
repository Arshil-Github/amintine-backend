const express = require("express")
const {UserDb} = require("./database")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
app.use(bodyParser.json())
app.use(cors({
    origin: ['https://amintine.vercel.app'], // Replace with your allowed origin(s)
    methods: ['POST', 'GET'], // Adjust methods used by your frontend
    credentials: true 
}))

const boysHostel = [15, 4, 7, 8];
const girlsHostel = [1, 5, 6, 9];
const timeBetweenRequestsInMs = 10800000; //3 Hours

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://amintine.vercel.app'); // Replace with your allowed origin(s)
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Include all methods used by your frontend
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add headers sent by your frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow sending cookies (if applicable)
  next();
});

app.post('/signUp', async (req, res) =>{
    //Expected body is a username, hostel, roomNumber, Bio, instaId(password)
    //Register this data in a database

    //Check if the user already exists. If yes  then dont create it rather update its' info

    const userExistsId = await DoesUserExists({
        username: req.body.username,
        roomNumber: req.body.roomNumber
    })

    //This object must follow the UserDb Schema
    let userData = {
        username: req.body.username,
        hostelNumber: req.body.hostelNumber,
        roomNumber: req.body.roomNumber,
        bio: req.body.bio,
        instaId: req.body.instaId
    }

    if(userExistsId != false)
    {
        //User already exists
        await UserDb.updateOne({
            _id: userExistsId
        }, userData)

        userData._id = userExistsId._id;

        res.status(200).json({
            msg: "User Updated Successfully",
            user: userData
        });
    }
    else{
        
        //User is new to the app --> Create his entry in the database
        let newUserId = await UserDb.create(userData)
        userData = {
            username: req.body.username,
            hostelNumber: req.body.hostelNumber,
            roomNumber: req.body.roomNumber,
            bio: req.body.bio,
            instaId: req.body.instaId,
            _id: newUserId._id
        }

        res.status(200).json({
            msg: "User Registered Successfully",
            user: userData
        });
    }

    
})

app.get('/findAMatch/:userId', async (req, res) =>{
    //Willl need a hostel number in body
    //Returns a random girl

    //Also get the user's id. then use that data to find if a request is possible
    const userId = req.params.userId;
    const thisUser = await UserDb.findById(userId)
    const lastRequestTime = (thisUser.lastRequest == null) ? 0 : thisUser.lastRequest;
    const timeSinceLastReq = (new Date()).getTime() - lastRequestTime;

    let outputMatch = null;
    let outputError = null;
    let outputTime = 0;


    if( timeSinceLastReq > timeBetweenRequestsInMs)
    {
        //The user can make the request
        const hostelNumber = parseInt(thisUser.hostelNumber);//Use this to find boy or girl
        const gender = GetGenderByHostel(hostelNumber)

        if(gender == "M")
        {
            let dbResponse = await UserDb.find({
                hostelNumber: {
                    "$in": girlsHostel
            }})
            let randomOutput = GetRandomFromArray(dbResponse)
            outputMatch = randomOutput;
        }
        else if(gender == "F")
        {
            let dbResponse = await UserDb.find({
                hostelNumber: {
                    "$in": boysHostel
            }})
            let randomOutput = GetRandomFromArray(dbResponse)
            outputMatch = randomOutput;
        }
        else{
            outputError = "hostelIssue"
        }
    }
    else{
        //The user cant make the request
        outputError= "timeIssue",
        outputTime= timeSinceLastReq
    }

    
    //If found a match, assign a timeout
    if(outputMatch != null)
    {
        //If the match is a dummy. then return a custom item
        let currentTime = (new Date()).getTime()
        //Update time
        await UserDb.updateOne({
            _id: userId
        }, {
            lastRequest: currentTime
        })
    }
    else{
        outputError= "userNumberIssue"
    }

    if(outputMatch == null || outputMatch == {})
    {
        error: "userNumberIssue";
    }
    
    res.json({
        match: outputMatch,
        error: outputError,
        time: outputTime
    })
    
})

async function DoesUserExists(data)
{
    try{
        //data include name, hostel room
        const username = data.username
        const roomNumber = parseInt(data.roomNumber)
    
        let existingId = await UserDb.exists({
            username: { $regex: new RegExp(username, 'i') },
            roomNumber: roomNumber
        })
    
        if(existingId == null)
        {
            return false
        }
        else{
            return existingId
        }
    }
    catch(e)
    {
        console.log(e)
        return false
    }
}
function GetGenderByHostel(hostelNumber)
{

    if(boysHostel.indexOf(hostelNumber) >= 0)
    {
        //Boys Hostel ---> Find them a girl
        return "M"
    }
    else if(girlsHostel.indexOf(hostelNumber) >= 0){
        return "F"
    }
    else{
        return "Invalid Gender"
    }
}
function GetRandomFromArray(array)
{
    let randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex]
}

const PORT = 3000
app.listen(PORT, () =>{
    console.log(`Connected to PORT ${PORT}`)
})
