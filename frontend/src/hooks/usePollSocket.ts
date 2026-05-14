// src/hooks/usePollSocket.ts
// Connects to the Socket.IO server, joins a poll room, and fires callbacks
// when vote counts change or the poll closes.
//
// Usage:
//   usePollSocket({
//     pollId,
//     enabled: poll.status === "active" && poll.showLiveResults,
//     onVoteUpdate: ({ counts, total }) => { ... },
//     onPollClosed: () => { ... },
//   });

import { useEffect } from 'react'
import {
  socket,
  EVENTS,
  type VoteUpdatePayload,
  type PollClosedPayload,
} from '../lib/socket'

interface UsePollSocketOptions {
  pollId: string
  enabled: boolean
  onVoteUpdate?: (payload: VoteUpdatePayload) => void
  onPollClosed?: (payload: PollClosedPayload) => void
}

export function usePollSocket({
  pollId,
  enabled,
  onVoteUpdate,
  onPollClosed,
}: UsePollSocketOptions) {
  useEffect(() => {
    if (!enabled) return

    // Connect if not already connected
    if (!socket.connected) socket.connect()

    // Join the poll room
    socket.emit(EVENTS.JOIN_POLL, { pollId })

    // Bind listeners
    function handleVoteUpdate(payload: VoteUpdatePayload) {
      if (payload.pollId !== pollId) return
      onVoteUpdate?.(payload)
    }

    function handlePollClosed(payload: PollClosedPayload) {
      if (payload.pollId !== pollId) return
      onPollClosed?.(payload)
    }

    socket.on(EVENTS.VOTE_UPDATE, handleVoteUpdate)
    socket.on(EVENTS.POLL_CLOSED, handlePollClosed)

    return () => {
      socket.emit(EVENTS.LEAVE_POLL, { pollId })
      socket.off(EVENTS.VOTE_UPDATE, handleVoteUpdate)
      socket.off(EVENTS.POLL_CLOSED, handlePollClosed)
      
      socket.disconnect()
    }
  }, [pollId, enabled])
}
