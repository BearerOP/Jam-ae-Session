import express from "express";
import { userAuth } from "../middleware";
import bcryptjs from "bcryptjs";
import prisma from "../db";
import jsonwebtoken from "jsonwebtoken";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
    res.send("User Router");
});

userRouter.get("/me", userAuth,
    async (req, res) => {
        try {
            const userId = req.userId as number;
            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatarUrl: true,
                    role: true,
                    createdAt: true
                }
            })

            if (!user) {
                res.status(404).json("User not found");
            }

            res.status(200).json({ data: user, message: "User details fetched successfully" });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json("An error occurred while fetching user details");
            return;
        }
    })

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        const isPasswordValid = await bcryptjs.compare(password, user?.password as string);
        if (user && isPasswordValid) {
            const token = jsonwebtoken.sign(
                { userId: user.id },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "1h",
                }
            );

            res.status(200).json({
                message: "User logged in successfully",
                token
            });
        } else {
            res.status(401).json("Invalid email or password");
        }
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json("An error occurred while logging in");
        return;
    }
});

userRouter.post("/signup", async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
            },
        });
        if (!user) {
            throw new Error("User creation failed!");
        }
        res.status(201).json("User created successfully");
        return;
    } catch (error: any) {
        console.error(error);
        if (error.code === "P2002") {
            res.status(400).json("User already exists");
        }
        res.status(500).json("An error occurred while creating user");
        return;
    }
});


export default userRouter;
