import { SlackAPIClient } from "slack-cloudflare-workers";

const fetchBotUserInfo = async (client: SlackAPIClient, botUserId: string): Promise<UserInfo | null> => {
  return client.bots
    .info({ bot: botUserId })
    .then((res) => {
      if (!res.bot) return null;
      const user = res.bot;
      return {
        id: user.id,
        name: user.name ?? user.id,
      };
    })
    .catch((e) => {
      console.error(`Failed to fetch info for bot ${botUserId}:`, e);
      return null;
    });
};

const fetchUserInfo = async (client: SlackAPIClient, userId: string): Promise<UserInfo | null> => {
  return client.users
    .info({ user: userId })
    .then((res) => {
      if (!res.user) return null;
      const user = res.user;
      return {
        id: user.id,
        name: user.real_name ?? user.name ?? user.id,
      };
    })
    .catch((e) => {
      console.error(`Failed to fetch info for user ${userId}:`, e);
      return null;
    });
};

const fetchMentioningGroupInfo = async (client: SlackAPIClient, userId: string): Promise<UserInfo | null> => {
  return client.team
    .info({ team: userId })
    .then((res) => {
      if (!res.team) return null;
      const user = res.team;
      return {
        id: user.id,
        name: user.name ?? user.id,
      };
    })
    .catch((e) => {
      console.error(`Failed to fetch info for menthioning group ${userId}:`, e);
      return null;
    });
};

export interface UserInfo {
  id?: string;
  name?: string;
}

export function extractMentions(messageText: string): string[] {
  return [...new Set([...messageText.matchAll(/<@([A-Z0-9]+)>/g)].map((m) => m[1]))];
}

export async function fetchUsers(client: SlackAPIClient, userIds: string[]): Promise<UserInfo[]> {
  const userInfos = await Promise.all(
    userIds.map(async (userId) => {
      const id = (userId ?? "").trim().toUpperCase();
      switch (true) {
        case id.startsWith("B"): // Bot ID
          return fetchBotUserInfo(client, id);
        case id.startsWith("S"): // Group ID
          return fetchMentioningGroupInfo(client, id);
        default: // User or Unknown ID
          return fetchUserInfo(client, id);
      }
    })
  );
  return userInfos.filter((info) => info !== null);
}
