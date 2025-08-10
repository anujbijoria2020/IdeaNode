//UserMiddleware
import jwt  from "jsonwebtoken";
import { JWT_TOKEN } from "./index.js";
import type {Request,Response, NextFunction } from "express";

export const UserMiddleWare = (req:Request,res:Response,next:NextFunction)=>{
  console.log("user middleware entered")
const token = req.headers.token;
if(!token){
 return res.status(400).send({
    message:"Access Token required",
  })
}
try{
  const decodedToken = jwt.verify(token as string,JWT_TOKEN as string);
(req as any).userId = (decodedToken as any)._id;
next();
}catch(error){
res.status(400).send({
    message:"Invalid or expired Token",
    success:false
  })
}
}