import express, { Router } from 'express';
import type { Request,Response } from 'express';
import { UserMiddleWare } from './MiddleWare.js';
import { Content,Link, User } from './db.js';
import crypto from 'crypto';
import {JWT_TOKEN, port} from './index.js';
import { SignupSchema } from './validators.js';
import bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';

 const route: Router = express.Router();

route.post("/api/v1/signup", async (req:Request, res:Response) => {
  const { username, password } = req.body;

  try {
    const validatedUser = SignupSchema.parse({ username, password });
  
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send({
        message: "username already exists",
        success: false,
      });
    }
    //hashing password

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });

    createdUser.save();
    return res.status(200).send({
      message: "user created successfully",
    });
  } catch (error:any) {
    if (error) {
      res.status(400).send({
        message: `signin error -${error.message}`,
        success: false,
      });
    } else {
      res.status(500).send({
        message: "server Error",
        success: false,
      });
    }
  }
});

route.post("/api/v1/signin", async (req:Request, res:Response) => {
  const { username, password } = req.body;

  try {
    const validatedUser = SignupSchema.parse({ username, password });

    const existingUser = await User.findOne({ username }).select("+password");
    if (!existingUser) {
      return res.status(400).send({
        message: "User does not exist",
        success: false,
      });
    }

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      return res.status(400).send({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        username,
        password,
        _id: existingUser._id,
      },
      JWT_TOKEN as string
    );

    res.status(200).send({
      message: "Signin successful",
      token: token,
      success: true,
      user: { id: existingUser._id, username: existingUser.username },
    });
  } catch (error: any) {
    res.status(400).send({
      message: `error - ${error.message || error}`,
      success: false,
    });
  }
});

route.post("/api/v1/signout", UserMiddleWare, async (req:Request, res:Response) => {
  console.log("after middleware");
});

route.post("/api/v1/content", UserMiddleWare, async (req, res) => {
  const { link, title, type } = req.body;
  const userId = (req as any).userId;
  const username = await User.findOne({ _id: userId });

  try {
    const response = await Content.create({
      link,
      title,
      type,
      userId,
    });

    res.status(200).send({
      message: "Content Created SuccessFully",
      success: true,
      Data: `link-${response.link}/ntitle-${response.title}/ntype-${response.type}/n Created By-${username?.username}`,
    });
  } catch (error) {
    if (error) {
      res.status(400).send({
        message: `Error while adding Content - ${error}`,
        success: false,
      });
    } else {
      res.status(200).send({
        message: "Internal Server Error",
        success: false,
      });
    }
  }
});

route.get("/api/v1/content", UserMiddleWare, async (req:Request, res:Response) => {
  const userId = (req as any).userId;
  try {
    const contents = await Content.find({ userId }).populate(
      "userId",
      "username"
    );
    return res.status(200).send({
      message: "Content Fetched SuccessFully",
      Contents: contents,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "contents not founded",
      success: false,
    });
  }
});

route.delete("/api/v1/content", UserMiddleWare, async (req, res) => {
  const contentId = req.body.contentId;
  const userId = (req as any).userId;
  try {
    const response = await Content.deleteOne({
      _id: contentId,
      userId,
    });

    res.status(200).send({
      message: "Deleted SuccessFully",
      DeletedContent: response,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "there is some error" + error,
      success: false,
    });
  }
});

route.post("/api/v1/content/share", UserMiddleWare, async (req, res) => {
  const userId = (req as any).userId;
  const share = req.body.share;
  try {
  if(share){
    const existingLink = await Link.findOne({
      userId:userId
    })
    if(existingLink){
      return res.status(200).json({
        message:"link already exists",
        hash:existingLink.hash,
      })
    }
      const hash: string = crypto.randomBytes(15).toString("hex");

    const newLink = await Link.create({
      userId,
      hash
    });
    
    return res.status(200).json({
      message: "link created sucessfully",
      link: `https://localhost:${port}/api/v1/content/share/${hash}`,
      hash: hash,
      success: true,
    });
  }
  else{
    await Link.deleteOne({userId});
    res.status(411).json({
      message:"link access set to FALSE!!"
    })
  }
  } catch (error) {
    return res.status(400).send({
      message: `error=${error}`,
      success: false,
    });
  }
});

route.get("/api/v1/content/share/:hash", async (req, res) => {
  try { 
    const { hash } = req.params;

    const link = await Link.findOne({ hash }).populate("userId","username");

    if (!link) {
      return res.status(411).json({
        message: "Invalid Link or Expired",
        success: false,
      });
    }

    console.log(link);
    console.log(link.userId);

    const ContentOfUser = await Content.find({ userId: link.userId});

   const user:any = await User.findOne({_id:link.userId});

   console.log(user); 

   if(!user){
    return res.status(411).json({
      message:"user Not Found ,error should ideally  not hrouteen"
    })
   }

    return res.status(200).json({
      message: "Link Retrieved SuccessFully",
      username: user.username,
      Data: ContentOfUser,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `error-${error}`,
      success: false,
    });
  }
});
 

export default route;