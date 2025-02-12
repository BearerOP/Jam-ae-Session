import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

async function userAuth(req: Request, res: Response, next: NextFunction) {

    try {
        const tokenHeader = req.headers['authorization'];

        if (!tokenHeader) {
            return res.status(401).send("Unauthorized");
        }

        const token = tokenHeader.split(' ')[1];
        if (!token) {

            return res.status(401).send("Unauthorized");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };

        if (!decoded) {
            return res.status(401).send("Unauthorized");
        }
        const userId = decoded.userId;
        req.userId = userId;
        next();

    } catch (error) {
        console.log(error);

        return res.status(401).send("Unauthorized");
    }
}


export { userAuth };