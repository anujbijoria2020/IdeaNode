import mongoose from "mongoose"
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

// User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Tag Schema
const TagSchema = new Schema({
  title: { type: String, required: true },
});

// Content Schema
const ContentSchema = new Schema({
  link: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  tags: [{ type: ObjectId, ref: "Tag" }],
  userId: { type: ObjectId, ref: "User", required: true },
});

// Link Schema
const LinkSchema = new Schema({
  hash: { type: String, required: true ,unique:true},
  userId: { type: ObjectId, ref: "User" ,required:true,unique:true},
});


export const User = mongoose.model("User", UserSchema);
export const Tag = mongoose.model("Tag", TagSchema);
export const Content = mongoose.model("Content", ContentSchema);
export const Link = mongoose.model("Link", LinkSchema);


