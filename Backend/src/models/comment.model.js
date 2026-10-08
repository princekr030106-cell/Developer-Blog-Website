const mongoose=require('mongoose');

const commentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true,
        trim:true
    },
    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},
{
    timestamps:true
})

const commentModel=mongoose.model('Comment',commentSchema);

module.exports=commentModel;