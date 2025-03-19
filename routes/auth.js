const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();
const router = express.Router();

/* ✅ Fix 1: Unique File Naming in Multer */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // File will be stored in /public/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ✅ Fix 2: Serve Static Files */
router.use("/uploads", express.static("public/uploads"));

/* ✅ USER REGISTER */
router.post("/register", upload.single("selectedFile"), async (req, res) => {
  try {
    const { fullName, email, phoneNo, password, confirmPassword } = req.body;
    const selectedFile = req.file;

    /* Validate Required Fields */
    if (!fullName || !email || !phoneNo || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    /* Validate Password Match */
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    /* Check if user already exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    /* Hash the password */
    const salt = await bcrypt.genSalt(10); // Explicitly set salt rounds
    const hashedPassword = await bcrypt.hash(password, salt);

    /* ✅ Fix 3: Correct File Path for Frontend */
    const selectedFilePath = selectedFile
      ? `/uploads/${selectedFile.filename}`
      : null;

    /* Create a new User */
    const newUser = new User({
      fullName,
      email,
      phoneNo,
      password: hashedPassword,
      selectedFilePath,
    });

    /* Save User */
    await newUser.save();

    res
      .status(200)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Registration failed!", error: err.message });
  }
});

/* ✅ USER LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Validate Inputs */
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required!" });
    }

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist!" });
    }

    /* Compare Password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    /* Generate JWT Token */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    /* Remove password from response */
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({ token, user: userObject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
