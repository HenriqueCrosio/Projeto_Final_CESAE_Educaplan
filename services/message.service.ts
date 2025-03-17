import "server-only";

import { Message } from "@/types/message";

interface GetMessageParams {
  type: "public" | "dashboard" | "admin";
}

export const getMessage = async ({
  type,
}: GetMessageParams): Promise<Message> => {
  switch (type) {
    case "public": {
      return {
        text: "This is a public message.",
      };
    }
    case "dashboard": {
      return { text: "This is a protected message." };
    }
    case "admin": {
      return {
        text: "Only authenticated users with the permission should access this page.",
      };
    }
  }
};

export const getPublicMessage = async () => {
  return getMessage({ type: "public" });
};

export const getProtectedMessage = async () => {
  return getMessage({ type: "dashboard" });
};

export const getAdminMessage = async () => {
  return getMessage({ type: "admin" });
};