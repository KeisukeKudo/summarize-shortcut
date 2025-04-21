import { UserInfo } from "./slack-user-info";
import { MessageElement } from "slack-web-api-client/dist/client/generated-response/ConversationsRepliesResponse";

type Conversation = {
  message: ParentMessage;
};
type ParentMessage = {
  sender: string;
  content: string;
  replies: ThreadReply[];
};
type ThreadReply = {
  sender: string;
  content: string;
};

/**
 * Markdown の blockquote 構文 (引用) を <quotation> タグでラップする
 *
 * @param {string} text
 * @returns
 */
function wrapMarkdownQuotes(text: string): string {
  const lines = text.split("\n");
  const out = [];
  let insideBQ = false;

  lines.forEach((line) => {
    const isBQ = /^\s*(?:>|&gt;)+\s?.+/.test(line);
    // 開始判定
    if (isBQ && !insideBQ) {
      out.push("<quotation>");
      insideBQ = true;
    }
    // 終了判定
    if (!isBQ && insideBQ) {
      out.push("</quotation>");
      insideBQ = false;
    }
    out.push(line);
  });

  if (insideBQ) out.push("</quotation>");

  return out.join("\n");
}

export function buildSummaryPrompt(messages: MessageElement[], users: UserInfo[]): string {
  const parent = messages.shift();
  const parentUserId = parent?.bot_id ?? parent?.user ?? "Unknown";
  const message: Conversation = {
    message: {
      sender: `<@${parentUserId}>`,
      content: wrapMarkdownQuotes(parent?.text ?? "Unknown"),
      replies: [],
    },
  };

  if (messages.length > 0) {
    message.message.replies = messages.map((message) => {
      const sender = message.bot_id ?? message.user;
      const text = message.text ?? "Unknown";
      return {
        sender: `<@${sender}>`,
        content: wrapMarkdownQuotes(text),
      };
    });
  }
  let messagesText = JSON.stringify(message);
  users.forEach((user) => {
    const userId = user.id ?? "Unknown";
    const userName = user.name ?? "Unknown";
    messagesText = messagesText.replaceAll(`<@${userId}>`, `'@${userName}'`);
  });
  return messagesText;
}
