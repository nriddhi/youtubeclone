import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  try { 
      
    const username = await User.findOne({ name: req.body.name });
      if(username) return res.status(406).json({err: "Username Taken"});

      const email = await User.findOne({ email: req.body.email });
      if(email) return res.status(406).json({err: "Email Already Exists"});

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    await newUser.save();
    res.status(200).json({msg: "User Created Successfully"});
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) return next(createError(400, "Wrong Credentials!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);
    const { password, ...others } = user._doc;

    res
    .cookie("access_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure:false
      })
      .status(200)
      .json(others);
  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      res
        .cookie("access_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure:false
        })
        .status(200)
        .json(user._doc);
    } else {
      const newUser = new User({
        ...req.body,
        fromGoogle: true,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);
      res
        .cookie("access_token", token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure:false
        })
        .status(200)
        .json(savedUser._doc);
    }
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(400).json({ message: token });
  }
  jwt.verify(String(token), process.env.JWT, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie('access_token');
    req.cookies['access_token'] = "";
    return res.status(200).json({code: 'logoutscs200', message: "Successfully Logged Out" });
})};
