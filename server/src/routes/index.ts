import express  from "express";
const router = express.Router();

import userRouter from "./userRouter";
import sessionRouter from "./sessionRouter";

router.get("/", (req, res) => {
  res.send("Hello, World!");
});

router.use("/user", userRouter);

router.use("/session", sessionRouter);

export default router;