import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessTokenAndRefreshToken } from '../controllers/auth.controller.js';

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    if(req.cookies)console.log("Verifying JWT : ",req.cookies);
    else console.log("No cookies found");

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!token && !refreshToken){
        throw new ApiError(401,"Unauthorised Request");
    }

    try {
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }

        req.user = user;
        console.log("User Verification Successful!!!");
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Attempt to refresh the access token
            try {
                const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(decodedRefreshToken._id);

                if (!user || user.refreshToken !== refreshToken) {
                    throw new ApiError(401, "Invalid refresh token");
                }

                // Generate new tokens
                const { accessToken: newAccessToken } = await generateAccessTokenAndRefreshToken(user._id);

                // Update cookies with the new access token
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: true,
                });

                req.user = { _id: user._id }; // Add user ID to the request object
                return next(); // Continue to the next middleware or route
            } catch (refreshError) {
                throw new ApiError(401,refreshError.message ||  "Refresh token expired or invalid");
            }
        } else {
            throw new ApiError(401,error?.message || "Unauthorized: Invalid access token");
        }
    }
});