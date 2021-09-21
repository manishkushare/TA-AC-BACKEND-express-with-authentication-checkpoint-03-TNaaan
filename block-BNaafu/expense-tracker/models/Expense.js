const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    category : {
        type: String,
        required : true
    },
    description : {
        name : {
            type : String,
            required: true
        },
        info : {
            type : String
        },
        amount : {
            type : Number,
            required : true
        },
        date : {
            type: Date,
            default : Date()
        }
    }
    ,
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    entryType : {
        type : String,
        default : "expense"
    }
}, {timestamps : true});

module.exports = mongoose.model('Expense', expenseSchema);