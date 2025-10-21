import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


// Create Express app and HTTP server
const app = express();
const server = http.createServer(app); // creating http bcoz socketio support this

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: "*",
  credentials: true,
}));

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users
export const userSocketMap = {}; // {userId: socketId }

// Socket io connection handler
io.on("connection", (socket)=> {

    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);
    
    // Whenever userid is available we insert in userSocketMap
    if(userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
    
})

// Middleware setup
// all the reqeust from the server pass in json format
// upload image maxm of 4mb
app.use(express.json({limit: "4mb"}));
// allows all the url to connect our server


// Routes setup
// Whenever we hit this point it shows server is live
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to mongoBD
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is running on PORT: " + PORT));  


