import { useEffect } from "react";
import {
  socket,
  EVENTS,
  type VoteUpdatePayload,
  type PollClosedPayload,
  type PollPublishedPayload,
} from "../lib/socket";

interface UsePollSocketOptions {
  pollId: string;
  enabled: boolean;
  onVoteUpdate?: (payload: VoteUpdatePayload) => void;
  onPollClosed?: (payload: PollClosedPayload) => void;
  onPollPublished?: (payload: PollPublishedPayload) => void;
}

export function usePollSocket({
  pollId,
  enabled,
  onVoteUpdate,
  onPollClosed,
  onPollPublished,
}: UsePollSocketOptions) {
  useEffect(() => {
    if (!enabled) return;

    // Connect if not already connected
    if (!socket.connected) socket.connect();

    // Join the poll room
    socket.emit(EVENTS.JOIN_POLL, { pollId });

    // Bind listeners
    function handleVoteUpdate(payload: VoteUpdatePayload) {
      if (payload.pollId !== pollId) return;
      onVoteUpdate?.(payload);
    }

    function handlePollClosed(payload: PollClosedPayload) {
      if (payload.pollId !== pollId) return;
      onPollClosed?.(payload);
    }

    function handlePollPublished(payload: PollPublishedPayload) {
      if (payload.pollId !== pollId) return;
      onPollPublished?.(payload);
    }

    socket.on(EVENTS.VOTE_UPDATE, handleVoteUpdate);
    socket.on(EVENTS.POLL_CLOSED, handlePollClosed);
    socket.on(EVENTS.POLL_PUBLISHED, handlePollPublished);

    return () => {
      socket.emit(EVENTS.LEAVE_POLL, { pollId });
      socket.off(EVENTS.VOTE_UPDATE, handleVoteUpdate);
      socket.off(EVENTS.POLL_CLOSED, handlePollClosed);
      socket.off(EVENTS.POLL_PUBLISHED, handlePollPublished);

      socket.disconnect();
    };
  }, [pollId, enabled]);
}
