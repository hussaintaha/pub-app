// mongoDB connection

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbconnection = () => {
  try {
    const dbURI =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI
        : "mongodb://localhost:27017/cartia";
    mongoose.connect(dbURI);
    console.log("connection success");
  } catch (error) {
    console.log("connection error", error);
  }
};

export default dbconnection

