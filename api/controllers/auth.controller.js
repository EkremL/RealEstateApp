import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Registration failed" });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //check if user exists
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    //check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid Credentials" });

    //generate cookie token

    const age = 7 * 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    //without cookie-parser
    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success");
    res
      //with cookie-parser and jwt
      .cookie("token", token, {
        httpOnly: true,
        // secure: true, // set to true if in production env
        maxAge: age,
      })
      .status(200)
      .json({ message: "login successful" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Login failed" });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "logout successful" });
};
