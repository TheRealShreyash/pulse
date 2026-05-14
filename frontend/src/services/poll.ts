import type { Poll } from "#/lib/types";

interface CreatePollPayload {
  title: string;
  description?: string;
  options: string[];
  isAnonymous: boolean;
  showLiveResults: boolean;
  expiresAt: string | null;
  status?: string;
}

export interface ResponsePayload {
  pollId: string;
  optionId: string;
}

export const createPoll = async (payload: CreatePollPayload): Promise<Poll> => {
  const response = await fetch("/api/poll/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to create poll");
  }

  const { data } = await response.json();

  return data;
};

export const getPoll = async (pollId: string) => {
  const response = await fetch(`/api/poll/poll?id=${pollId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to get poll");
  }

  const { data } = await response.json();

  return data;
};

export const publishPoll = async (pollId: string): Promise<Poll> => {
  const response = await fetch(`/api/poll/publish?id=${pollId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to publish poll");
  }

  const { data } = await response.json();
  return data;
};

export const closePoll = async (pollId: string): Promise<Poll> => {
  const response = await fetch(`/api/poll/close?id=${pollId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to close poll");
  }

  const { data } = await response.json();
  return data;
};

export const getUserPolls = async (): Promise<Poll[]> => {
  const response = await fetch(`/api/poll/user-polls`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to fetch user polls");
  }

  const { data } = await response.json();

  return data;
};

export const respondToPoll = async (payload: ResponsePayload) => {
  const response = await fetch("/api/poll/respond", {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to submit vote");
  }

  const { data } = await response.json();
  return data;
};
