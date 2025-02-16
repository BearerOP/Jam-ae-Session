import express from "express";
import prisma from "../db";
import { userAuth } from "../middleware";


const sessionRouter = express.Router();
sessionRouter.post("/create", userAuth, async (req, res) => {
    const { sessionName } = req.body;
    try {
        const session = await prisma.session.create({
            data: { sessionName, hostId: req.userId! },
        });
        res.status(201).json(session);
        return;
    } catch (error) {
        res.status(500).json("Error creating session");
        return;
    }
});

sessionRouter.get("/active", userAuth, async (req, res) => {
    try {
        const userId = req.userId!;
        const sessions = await prisma.session.findMany({
            where: { isLive: true , hostId: userId! },
        });
        res.status(200).json(sessions);
        return;
    } catch (error) {
        res.status(500).json("Error fetching active sessions");
        return;
    }
});



export default sessionRouter;
