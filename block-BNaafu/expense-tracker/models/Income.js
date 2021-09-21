    const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeSchema = new Schema({
    source : {
        type : String, 
    },
    description :{
        name : {
            type : String,
            required: true
        },
        amount : {
            type : Number,
            required : true
        },
        date : {
            type: Date,
            default : Date()
        }

    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    entryType : {
        type : String,
        default : "income"
    }
},{timestamps : true});

module.exports = mongoose.model('Income',incomeSchema );