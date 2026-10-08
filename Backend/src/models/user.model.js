const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    },
    avatar:{
        type:String,
        default:''
    },
    bio:{
        type:String,
        default:''
    }

},
{
    timestamps:true
});

const userModel=mongoose.model("User",userSchema);

module.exports=userModel;