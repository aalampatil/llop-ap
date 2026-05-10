console.log("Hello from Bun!");
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { webhookRouter } from "./modules/webhook/webhook.routes";
import { userRouter } from "./modules/user/user.routes";
import { questionRouter } from "./modules/question/question.routes";
import { pollRouter } from "./modules/poll/poll.routes";

async function main() {
  const app = express();
  const port = 3000;
  const io = new Server();
  const server = createServer(app);

  io.attach(server);
  app.use(cors());

  app.get("/health", (req, res) => {
    return res.send("I'm up and running");
  });
  app.get("/", (req, res) => {
    return res.send("LLOP-aP");
  });

  app.use("/api/webhook/", webhookRouter);
  app.use("/api/user", userRouter);
  app.use("/api/question", questionRouter);
  app.use("/api/poll", pollRouter);

  server.listen(port, () => {
    console.log(`server is listening on http://localhost:${port}`);
  });
}

main();
