const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String, // Fixed: Changed from "tel" to String
      required: true,
      unique: true,
    },
    selectedFilePath: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    tripList: {
      type: [Object], // Optional: Defines an array of objects
      default: [],
    },
    wishList: {
      type: [String], // Optional: Defines an array of strings
      default: [],
    },
    propertyList: {
      type: [Object], // Optional: Defines an array of objects
      default: [],
    },
    reservationList: {
      type: [Object], // Optional: Defines an array of objects
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
