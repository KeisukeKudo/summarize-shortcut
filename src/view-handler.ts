import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { getProgressView, getDoneView, getErrorView } from "./slack-view-templates";
import { extractMentions, fetchUsers } from "./utils/slack-user-info";
import { buildSummaryPrompt } from "./utils/prompt-builder";
import { summarizeTextWithVertexAI } from "./utils/summarizer";
import { GoogleCloudProjectEnv } from "./utils/summarizer";

export default async function viewHandler(app: SlackApp<SlackEdgeAppEnv & GoogleCloudProjectEnv>) {
  app.view(
    "summarize-modal",
    async () => {
      return getProgressView();
    },
    async ({ context, payload, env }) => {
      const viewId = payload.view.id;
      try {
        const metadata = JSON.parse(payload.view.private_metadata);
        const replies = await context.client.conversations.replies({
          channel: metadata.channelId,
          ts: metadata.targetTs,
        });
        if (!replies.ok) {
          throw new Error(`Failed to fetch replies: ${replies.error}`);
        }
        const messages = replies.messages ?? [];
        const userIds = Array.from(
          new Set(
            messages.flatMap((m) => {
              const user = m.bot_id ?? m.user ?? "Unknown";
              const replayUsers = m.reply_users ?? [];
              const mentions = extractMentions(m.text ?? "");
              return [...new Set([user, ...replayUsers, ...mentions])];
            })
          )
        );

        const users = await fetchUsers(context.client, userIds);
        const messagesText = buildSummaryPrompt(messages, users);
        const summarizerEnv = env as GoogleCloudProjectEnv;

        const [summary, channelId] = await Promise.all([
          await summarizeTextWithVertexAI(messagesText, summarizerEnv),
          await context.client.conversations.open({ users: payload.user.id }).then((res) => res.channel?.id ?? null),
        ]);

        await context.client.files.uploadV2({
          channel_id: channelId ?? "",
          initial_comment: `<${metadata.permalink}|メッセージ>を要約しました！`,
          content: summary ?? "要約に失敗しました。",
          filename: `summary_${Date.now()}.md`,
        });
        const view = getDoneView(viewId, context.botUserId);
        await context.client.views.update(view).catch((e) => {
          // NOTE: ダイアログが閉じられていた場合のエラーは無視
          if (e.error !== "not_found") throw e;
        });
      } catch (e) {
        console.error(e);
        await context.client.views.update(getErrorView(viewId));
      }
    }
  );
}
