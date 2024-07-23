const mongoose = require('mongoose')

const repliesSchema = new mongoose.Schema({
    threadId :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'threads'
    },
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'users'
    },
    author :{
        type : String,
        required : true,
        ref : 'users'
    },
    content :{
        type : String,
        required : true,
        trim : true
    },
    date :{
        type : Date,
        default : new Date()
    },
    upvotes :{
        type : Number,
        default : 0
    }   
})


const repliesModel = new mongoose.model('replies', repliesSchema)


module.exports = repliesModel;