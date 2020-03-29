const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;


const postScheme = new mongoose.Schema(
    {
        title: {
            type: String,
            required: "This is required",
            minlength:4, 
            maxlength: 150
        },

        body: {
            type: String,
            required: "This is required.",
            minlength: 4,
        }, 

        photo: {
            data: Buffer,
            contentType: String
        },

        postedBy: {
            type: ObjectId,
            ref: "User"
        },

        created: {
            type: Date,
            default: Date.now
        }

    }

);

module.exports = mongoose.model("Post", postScheme)