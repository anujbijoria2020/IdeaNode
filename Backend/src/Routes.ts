import express, { Router } from 'express';
import type { Request, Response } from 'express';
import { UserMiddleWare } from './MiddleWare.js';
import { Content, Link, User } from './db.js';
import crypto from 'crypto';
import { JWT_TOKEN, port } from './index.js';
import { SignupSchema } from './validators.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { generateEmbedding, generateAnswer, cosineSimilarity } from './utils/GeminiService.js';
import { extractTextFromPDF, extractTweet } from './utils/extractor.js';
import { extractYouTubeTranscript, extractYouTubeTranscriptWithRetry, extractYouTubeMetadata } from './utils/YoutubeService.js';

const route: Router = express.Router();

// 📁 Set up multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req:any, file:any, cb:any) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req:any, file:any, cb:any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req:any, file:any, cb:any) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// 📌 CREATE CONTENT
route.post(
  "/api/v1/content",
  UserMiddleWare,
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { link, title, type, note } = req.body;
    let contentTitle = title;
    const userId = (req as any).userId;
    try {
      let embeddings: number[] = [];
      let filePath: string | null = null;
      let text;

      // Handle PDF upload
      if (type === "pdf" && req.file) {
        filePath = req.file.path;
        if (!filePath) {
          return res.status(400).json({
            message: "PDF file upload failed",
            success: false,
          });
        }
        // TODO: Extract text from PDF and generate embeddings
         text = await extractTextFromPDF(filePath);
        console.log(text);
        embeddings = await generateEmbedding(text);
        console.log(embeddings.slice(0,10));
      }

      // Generate embeddings for NOTE type
      if (type === "note" && note) {
        console.log("🔍 Generating embeddings for note...");
        text = note;
        embeddings = await generateEmbedding(text);
      }

      if (type === 'twitter' && link) {
        text = await extractTweet(link);
        if (!text) {
          console.warn("⚠️ Twitter text extraction failed. Using fallback text.");
          text = `Twitter Post: ${contentTitle || link}`;
        }
        console.log("Twitter Text to embed:", text);
        embeddings = await generateEmbedding(text as any);
      }

      if (type === "youtube" && link) {
        console.log("🎥 Processing YouTube link...");
        let ytText = "";
        let extractedTitle = "";

        // 1. Fetch metadata (Title & Description) as fallback or context
        let metaTitle = '';
        let metaDescription = '';
        try {
          const metadata = await extractYouTubeMetadata(link);
          if (metadata) {
            extractedTitle = metadata.title;
            metaTitle = metadata.title;
            metaDescription = metadata.description;
            // Fallback ytText with metadata if transcript not yet set
            ytText = `Title: ${metaTitle}\nDescription: ${metaDescription}`;
          }
        } catch (err: any) {
          console.warn("⚠️ YouTube metadata extraction failed:", err.message);
        }

        // 2. Fetch transcript if available
        try {
          const transcript = await extractYouTubeTranscriptWithRetry(link);
          if (transcript) {
            // Combine metadata (if any) with transcript
            if (metaTitle || metaDescription) {
              ytText = `Title: ${metaTitle}\nDescription: ${metaDescription}\nTranscript: ${transcript}`;
            } else {
              ytText = transcript;
            }
          }
        } catch (err: any) {
          console.warn('⚠️ YouTube transcript extraction failed:', err.message);
        }

        // 3. Reject if no transcript found (or no content)
        if (!ytText) {
          return res.status(400).json({
            message: "Could not extract transcript from YouTube video. Please try another video.",
            success: false,
          });
        }

        text = ytText;
        embeddings = await generateEmbedding(text);

        // Auto-fill empty title with extracted title
        if (!contentTitle && extractedTitle) {
          contentTitle = extractedTitle;
        }
      }

      // Create content document
      const createdContent = await Content.create({
        link: filePath || link || null,
        title: contentTitle || "Untitled Content",
        type,
        userId,
        text:text||"",
        embedding: embeddings,
      });

      const user = await User.findById(userId).select("username");
      return res.status(200).json({
        message: "Content created successfully ✅",
        success: true,
        content:{
          id: createdContent._id,
          title: createdContent.title,
          type: createdContent.type,
          link: createdContent.link,
          createdBy: user?.username,
        },
      });
    } catch (error: any) {
      console.error("❌ Error while adding content:", error);
      return res.status(400).json({
        message: `Error while adding content - ${error.message}`,
        success: false,
      });
    }
  }
);

// 📌 QnA ROUTE
route.post("/api/v1/qna", UserMiddleWare, async (req: Request, res: Response) => {
  const { question, type = "note" } = req.body;
  const userId = (req as any).userId;

  if (!question || question.trim() === "") {
    return res.status(400).json({
      message: "Question is required",
      success: false,
    });
  }

  try {
    // Step 1: Generate embedding for the question
    console.log("🔍 Generating embedding for question:", question);
    const questionEmbedding = await generateEmbedding(question);

    if (questionEmbedding.length === 0) {
      return res.status(500).json({
        message: "Failed to generate question embedding",
        success: false,
      });
    }

    // Step 2: Build query to find similar content
    const query: any = {
      userId,
      embedding: { $exists: true, $ne: [] },
    };

    if (type && type !== "all") {
      query.type = type.toLowerCase();
    }

    console.log("🔍 Finding similar content with query:", query);

    // Step 3: Find all content with embeddings
    const allContent = await Content.find(query).select(
      "title type text link embedding"
    );

    if (allContent.length === 0) {
      return res.status(200).json({
        answer: `I couldn't find any ${
          type === "all" ? "" : type
        } content to answer your question. Try adding more content or changing the content type.`,
        relatedContent: [],
        success: true,
      });
    }

    // Step 4: Calculate similarity scores
    const contentWithSimilarity = allContent
      .map((content:any) => ({
        id: content._id.toString(),
        title: content.title,
        type: content.type,
        text: content.text || "",
        similarity: cosineSimilarity(questionEmbedding, content.embedding),
      }))
      .filter((content:any) => content.similarity > 0.3) // Filter out low similarity
      .sort((a:any, b:any) => b.similarity - a.similarity)
      .slice(0, 3); // Top 3 most similar

    console.log(`✅ Found ${contentWithSimilarity.length} similar content pieces`);

    if (contentWithSimilarity.length === 0) {
      return res.status(200).json({
        answer: "I couldn't find any relevant content to answer your question. The similarity scores were too low.",
        relatedContent: [],
        success: true,
      });
    }

    // Step 5: Prepare context from similar content
    const context = contentWithSimilarity
      .map(
        (content:any, idx:number) =>
          `[Content ${idx + 1}: ${content.title}]\n${content.text}`
      )
      .join("\n\n");

    console.log("📝 Context prepared, length:", context.length);
    console.log("📝 Context preview:", context.slice(0, 200));

    // Step 6: Generate answer using Gemini
    console.log("🤖 Generating answer with Gemini...");
    const answer = await generateAnswer(question, context);

    // Step 7: Return response
    return res.status(200).json({
      answer,
      relatedContent: contentWithSimilarity.map((content:any) => ({
        id: content.id,
        title: content.title,
        type: content.type,
        similarity: content.similarity,
      })),
      success: true,
    });
  } catch (error: any) {
    console.error("❌ Error in QnA route:", error);
    return res.status(500).json({
      message: `Error processing question: ${error.message}`,
      success: false,
    });
  }
});

// 📌 SIGNUP
route.post("/api/v1/signup", async (req: Request, res: Response) => {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });

    await createdUser.save();
    return res.status(200).send({
      message: "user created successfully",
      success: true,
    });
  } catch (error: any) {
    res.status(400).send({
      message: `signup error - ${error.message}`,
      success: false,
    });
  }
});

// 📌 SIGNIN
route.post("/api/v1/signin", async (req: Request, res: Response) => {
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

// 📌 SIGNOUT
route.post("/api/v1/signout", UserMiddleWare, async (req: Request, res: Response) => {
  console.log("after middleware");
  return res.status(200).json({
    message: "Signout successful ✅",
    success: true,
  });
});

// 📌 GET ALL CONTENT
route.get("/api/v1/content", UserMiddleWare, async (req: Request, res: Response) => {
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
      message: "contents not found",
      success: false,
    });
  }
});

// 📌 DELETE CONTENT
route.delete("/api/v1/content", UserMiddleWare, async (req: any, res: any) => {
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
  } catch (error: any) {
    res.status(400).send({
      message: "there is some error" + error.message,
      success: false,
    });
  }
});

// 📌 SHARE CONTENT
route.post("/api/v1/content/share", UserMiddleWare, async (req: any, res: any) => {
  const userId = (req as any).userId;
  const share = req.body.share;
  try {
    if (share) {
      const existingLink = await Link.findOne({
        userId: userId,
      });
      if (existingLink) {
        return res.status(200).json({
          message: "link already exists",
          hash: existingLink.hash,
        });
      }
      const hash: string = crypto.randomBytes(15).toString("hex");

      const newLink = await Link.create({
        userId,
        hash,
      });

      return res.status(200).json({
        message: "link created sucessfully",
        link: `https://localhost:${port}/api/v1/content/share/${hash}`,
        hash: hash,
        success: true,
      });
    } else {
      await Link.deleteOne({ userId });
      res.status(411).json({
        message: "link access set to FALSE!!",
      });
    }
  } catch (error) {
    return res.status(400).send({
      message: `error=${error}`,
      success: false,
    });
  }
});

// 📌 GET SHARED CONTENT
route.get("/api/v1/content/share/:hash", async (req: any, res: any) => {
  try {
    const { hash } = req.params;

    const link = await Link.findOne({ hash }).populate("userId", "username");

    if (!link) {
      return res.status(411).json({
        message: "Invalid Link or Expired",
        success: false,
      });
    }

    console.log(link);
    console.log(link.userId);

    const ContentOfUser = await Content.find({ userId: link.userId });

    const user: any = await User.findOne({ _id: link.userId });

    console.log(user);

    if (!user) {
      return res.status(411).json({
        message: "user Not Found, error should ideally not happen",
      });
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