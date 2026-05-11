import { Socket, type Server } from "socket.io";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`socket:[${socket.id}]-connected`);

    socket.on("poll:join", (pollId: string) => {
      socket.join(`poll:${pollId}`);
    });

    socket.on("poll:leave", (pollId: string) => {
      socket.leave(`poll:${pollId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const registerSockerHnadlers = registerSocketHandlers;
