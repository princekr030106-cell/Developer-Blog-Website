const mongoose=require('mongoose');

const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    content:{
        type:String,
        required:true
    },
    featuredImage:{
        type:String,
        default:''
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    tags:{
        type:[String],
        default:[]
    },
    status:{
        type:String,
        enum:['draft','published'],
        default:'draft'
    },
    views:{
        type:Number,
        default:0
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'User',
        default:[]
    }
},
{
    timestamps:true
});

const blogModel=mongoose.model("Blog",blogSchema);

module.exports=blogModel;