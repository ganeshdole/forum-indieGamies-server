const mongoose = require('mongoose');

const threadsSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'users'
    },
    author: {
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    replies: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    }
},{
    timestamps: true 
});

const threadsModel = mongoose.model('threads', threadsSchema);

module.exports = threadsModel;
