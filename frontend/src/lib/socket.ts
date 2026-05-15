import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  {
    autoConnect: false,
    withCredentials: true, // sends the Iris session cookie
  },
);

export const EVENTS = {
  // client → server
  JOIN_POLL: "client:poll:join",
  LEAVE_POLL: "client:poll:leave",

  // server → client
  VOTE_UPDATE: "server:poll:update",
  POLL_CLOSED: "server:poll:closed",
} as const;

export interface JoinPollPayload {
  pollId: string;
}
export interface LeavePollPayload {
  pollId: string;
}

export interface VoteUpdatePayload {
  pollId: string;
  counts: number[]; // index matches option order
  total: number;
}

export interface PollClosedPayload {
  pollId: string;
}
