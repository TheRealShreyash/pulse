import type { Server } from "socket.io";

let _io: Server;

export function initEmitter(io: Server) {
  _io = io;
}

export const pollEmitter = {
  voteUpdate(pollId: string, counts: number[], total: number) {
    _io.to(pollId).emit("server:poll:update", { pollId, counts, total });
  },
  pollClosed(pollId: string) {
    _io.to(pollId).emit("server:poll:closed", { pollId });
  },
};
