import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {User} from "../models/user.model.js";
import "dotenv/config";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

const parseExpiry = (expiryString) => {
    const unit = expiryString.slice(-1); // Get the unit (e.g., 'd')
    const value = parseInt(expiryString.slice(0, -1), 10); // Get the numeric value

    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        case 'h': return value * 60 * 60 * 1000;      // Convert hours to milliseconds
        case 'm': return value * 60 * 1000;           // Convert minutes to milliseconds
        case 's': return value * 1000;                // Convert seconds to milliseconds
        default: throw new Error('Invalid expiry format');
    }
};

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Token generation failed");
    }
}

const register = asyncHandler(async (req,res)=>{
    console.log("Register request hitting !!!");
    const {email,username,fullname,password} = req.body;
    if(!email || !username ||!fullname ||  !password){
        throw new ApiError (400,"Please provide all fields");
    }

    const existedUser = await User.findOne(
        {
            $or : [ {email},{username}]
        }
    )

    if(existedUser){
        throw new ApiError(400,"User already existed");
    }

    const avatarLocalPath =await req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Please provide avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(510,"Something went wrong while uploading avatar");
    }

    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        password,     
        avatar : avatar.url,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            createdUser
        )
    );
});

const login = asyncHandler(async(req,res)=>{
    console.log("Login request hitting !!!");

    const {email,username,password} = req.body;
    if(!email || !username || !password){
        throw new ApiError(400,"Please provide all fields");
    }

    const user = await User.findOne(
        {
            $or: [{email},{username}],
        }
    )

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(500,"Something went wrong while logging in user");
    }

    const accessCookieOptions = {
        httpOnly:true,
        secure:true,
        expires:new Date(Date.now() + parseExpiry(process.env.ACCESS_TOKEN_EXPIRY)),
    }
    const refreshCookieOptions = {
        httpOnly:true,
        secure:true,
        expires:new Date(Date.now() + parseExpiry(process.env.REFRESH_TOKEN_EXPIRY)),
    }

    return res
     .status(200)
     .cookie("accessToken",accessToken,accessCookieOptions)
     .cookie("refreshToken",refreshToken,refreshCookieOptions)
     .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken,
            },
            "User loggedIn successfully",
    )
    )
});

const logout = asyncHandler(async(req,res)=>{
    console.log("Logout request hitting !!!");

    const logoutUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:null,
            }
        },
        {
            new:true,
        }
    );

    const cookieOptions = {
        httpOnly:true,
        secure:true,
    }

    return res
     .status(200)
     .clearCookie("accessToken",cookieOptions)
     .clearCookie("refreshToken",cookieOptions)
     .json(
        new ApiResponse(
            200,
            {},
            "User loggedOut successfully",
    )
    );
});

export {register,login,logout,generateAccessTokenAndRefreshToken};