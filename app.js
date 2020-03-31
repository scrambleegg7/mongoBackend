const express = require('express');
const app = express();

const expressValidator = require('express-validator')
const bodyParser = require("body-parser");

const morgan = require('morgan');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');

// environment from .env
dotenv.config();
const port = process.env.PORT || 8080;

console.log("MongoURI to be connected....",process.env.MONGO_URI)
console.log("")

// mongo DB
mongoose.connect(
        process.env.MONGO_URI, 
        { 
            useUnifiedTopology: true, 
            useNewUrlParser: true
        }
    )
.then( () => console.log("mongoDB Successfully connected") )

mongoose.connection.on("error", err => {
    console.log(`mongoDB connection error: ${err.message}`)
});


// bring in routes
const postRoutes = require('./routes/post')
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const myOwnMiddleWare = (req, res, next) => {
    console.log("middleware applied....");
    next();
}

app.get('/api', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        }
        const docs = JSON.parse(data);
        res.json(docs);
    });
});


app.use( morgan("dev") );
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator())
app.use('/api', postRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);


//app.use("/", postRoutes);


app.listen(port, ()  => {
    console.log(`A node js api is listening on port : ${port}`);
})