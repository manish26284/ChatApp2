import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
// We will use this to update the data
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
// Now we can send message to other user and other user receiver instantly using socket.io
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
