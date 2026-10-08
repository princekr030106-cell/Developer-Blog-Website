const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const bcrypt=require("bcryptjs")


async function userRegister(req,res){

    const {name , email , password,bio}=req.body;

    const isUserAlreadyExists=await userModel.findOne({
        $or:[{name},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(409).json({
            message:"User is already exists"
        })
    }

    const hash=await bcrypt.hash(password,10)
    const user=await userModel.create({
        name,
        email,
        password:hash,
        bio:bio || ''
    })

    const token=jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET);

    res.cookie("token",token)

    res.status(201).json({
        success:true,
        message:"User register successfully",
        data:{
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        }
    })
}

async function userLogin(req,res) {
    const {name,email,password}=req.body

    const user=await userModel.findOne({
        $or:[{email},{name}]
    })

    if(!user){
        return res.status(403).json({
            message:"Invalid credential"
        })
    }

    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(409).json({
            message:"Invalid password"
        })
    }

    const token=await jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET)

    res.cookie("token",token)

    res.status(200).json({
        success:true,
        message:"User login successfully",
        data:{
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                avatar:user.avatar
            }
        }
    })

}

async function getMe(req,res){
    const user=await userModel.findById(req.user.id).select('-password');
    if(!user){
        return res.status(404).json({
            message:'User not found'
        })
    }
    res.status(200).json({
        success:true,
        message:'Successfully get profile.',
        data:user
    })
}

async function userLogout(req,res){
    res.clearCookie("token")
    res.status(200).json({
        message:'Logged out successfully.'
    })
}

module.exports={
    userRegister,
    userLogin,
    getMe,
    userLogout
}