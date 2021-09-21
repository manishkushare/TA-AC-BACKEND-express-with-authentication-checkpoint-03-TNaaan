const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email : {
        type : String,
        
        unique : true
    },
    providers : {
        type : [String]
    },
    local : {
        name : {
            type : String,
        },
        password : {
            type : String,
        },
        age : {
            type : String,
            
        },
        phone : {
            type : String,

        },
        address : {
            city : {
                type : String,
                
            },
            state : {
                type : String,
                
            },
            country : {
                type : String,
                
            },
            pincode : {
                type : String
            }
        },
        avatar : {
            type : String
        }
    },
    github : {
        name : {
            type : String,
        },
        login : {
            type : String,
        },
        location : {
            type : String
        }
        
    },
    google : {
        name : {
            type : String,
        },
        
    },
    expenseRef: [
        {
            type : Schema.Types.ObjectId,
            ref : "Expense"

        }
    ],
     
});

userSchema.pre('save', async function(next){
    try {
        if(this.local.password ){
            this.local.password = await bcrypt.hash(this.local.password,10);
            next();
        }
    } catch (error) {
        next(error);
    }
})

userSchema.methods.isVerified = async function(password){
    try {
        const verify = await bcrypt.compare(password, this.local.password);
        return verify;
    } catch (error) {
        return error;
    }
}

module.exports = mongoose.model("User", userSchema);