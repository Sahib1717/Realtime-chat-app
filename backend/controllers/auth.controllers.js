import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import generateTokenandSetCookie from "../utils/generateToken.js";

export const loginUser=async(req,res)=>{
    try {
        const {username,password}=req.body
        const user=await User.findOne({username})
        const isPasswordCorrect=await bcrypt.compare(password,user?.password || "")

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid Login credentials"})
        }

        generateTokenandSetCookie(user._id,res)

        res.status(201).json({
            _id:user._id,
            fullName:user.fullName,
            username:user.username,
            profilePic:user.profilePic
        })
    } catch (error) {
        console.log("Error in login controller :",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const signupUser=async(req,res)=>{
    try {
        const {fullName,username,password,confirmPassword,gender}=req.body

        if(password !== confirmPassword){
            return res.status(400).json({error:"Passwords do not match"})
        }

        const user=await User.findOne({username})
        if(user){
            return res.status(400).json({error:"User already exists"})
        }

        //Hashing password here
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const boyProfilePic=`https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic=`https://avatar.iran.liara.run/public/girl?username=${username}`

        const newUser=new User({
            fullName,
            username,
            password:hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic: girlProfilePic
        })

        if(newUser){

            generateTokenandSetCookie(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                username:newUser.username,
                profilePic:newUser.profilePic
            })
        }else{
            res.status(400).json({error:"Invalid User Data"})
        }


    } catch (error) {
        console.log("Error in signup controller :",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const logoutUser=(req,res)=>{
    
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({error:"Logged Out successfully"})
    } catch (error) {
        console.log("Error in logout controller :",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}