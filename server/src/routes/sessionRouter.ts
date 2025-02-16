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
    } catch (error) {
        res.status(500).json("Error creating session");
    }
});

sessionRouter.get("/active", async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({ where: { isLive: true } });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json("Error fetching active sessions");
    }
});

// Get all sessions of a user (hosted or joined)
sessionRouter.get("/my-sessions", userAuth, async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { OR: [{ hostId: req.userId }, { participants: { some: { userId: req.userId } } }] },
            include: { participants: true },
        });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json("Error fetching user sessions");
    }
});

// Join a session
sessionRouter.post("/join/:sessionId", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    try {
        await prisma.userSession.create({
            data: { userId: req.userId!, sessionId: parseInt(sessionId) },
        });
        res.status(200).json("Joined session successfully");
    } catch (error) {
        res.status(500).json("Error joining session");
    }
});

// Remove a user from session (host only)
sessionRouter.delete("/:sessionId/remove/:userId", userAuth, async (req, res) => {
    const { sessionId, userId } = req.params;
    try {
        const session = await prisma.session.findUnique({ where: { id: parseInt(sessionId) } });
        if (!session || session.hostId !== req.userId) {
            res.status(403).json("Unauthorized to remove users");
            return;
        }

        await prisma.userSession.delete({
            where: { userId_sessionId: { userId: parseInt(userId), sessionId: parseInt(sessionId) } },
        });
        res.status(200).json("User removed from session");
        return;
    } catch (error) {
        res.status(500).json("Error removing user");
        return;
    }
});

// End a session (host only)
sessionRouter.post("/end/:sessionId", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    try {
        await prisma.session.update({
            where: { id: parseInt(sessionId), hostId: req.userId },
            data: { isLive: false },
        });
        res.status(200).json("Session ended successfully");
    } catch (error) {
        res.status(500).json("Error ending session");
    }
});

// Delete a session (host only)
sessionRouter.delete("/:sessionId", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    try {
        await prisma.session.delete({
            where: { id: parseInt(sessionId), hostId: req.userId },
        });
        res.status(200).json("Session deleted successfully");
    } catch (error) {
        res.status(500).json("Error deleting session");
    }
});

// Update session details (host only)
sessionRouter.put("/:sessionId", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { sessionName } = req.body;
    try {
        const session = await prisma.session.update({
            where: { id: parseInt(sessionId), hostId: req.userId },
            data: { sessionName },
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json("Error updating session");
    }
});

// Get a specific session by ID
sessionRouter.get("/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await prisma.session.findUnique({
            where: { id: parseInt(sessionId) },
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json("Error fetching session details");
    }
});

// Add a video to session queue
sessionRouter.post("/:sessionId/queue", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { youtubeUrl } = req.body;
    try {
        const position = (await prisma.sessionQueue.count({ where: { sessionId: parseInt(sessionId) } })) + 1;

        const queueItem = await prisma.sessionQueue.create({
            data: { sessionId: parseInt(sessionId), youtubeUrl, userId: req.userId!, position },
        });
        res.status(201).json(queueItem);
    } catch (error) {
        res.status(500).json("Error adding to queue");
    }
});

// Get queue for a session
sessionRouter.get("/:sessionId/queue", async (req, res) => {
    const { sessionId } = req.params;
    try {
        const queue = await prisma.sessionQueue.findMany({
            where: { sessionId: parseInt(sessionId) },
            orderBy: { position: "asc" },
        });
        res.status(200).json(queue);
    } catch (error) {
        res.status(500).json("Error fetching queue");
    }
});

// Reorder queue (host only)
sessionRouter.put("/:sessionId/queue/reorder", userAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { newOrder } = req.body; // Expected format: [{ id: queueId, position: newPosition }]
    try {
        const session = await prisma.session.findUnique({ where: { id: parseInt(sessionId) } });
        if (!session || session.hostId !== req.userId) {
            res.status(403).json("Unauthorized to reorder queue");
            return;
        }

        const updatePromises = newOrder.map((item: { id: number; position: number }) =>
            prisma.sessionQueue.update({
                where: { id: item.id },
                data: { position: item.position },
            })
        );

        await Promise.all(updatePromises);
        res.status(200).json("Queue reordered successfully");
        return;
    } catch (error) {
        res.status(500).json("Error reordering queue");
        return;
    }
});

export default sessionRouter;
