import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/chatbot", chatbotRoutes);

export default app;
