import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { getRequestingAdditionView, getIntroductionView } from "./slack-view-templates";
import { GoogleCloudProjectEnv } from "./utils/summarizer";

export default async function shortcutHandler(app: SlackApp<SlackEdgeAppEnv & GoogleCloudProjectEnv>) {
  app.shortcut("summarize", async ({ context, body, payload }) => {
    if (payload.type !== "message_action") {
      console.error("This shortcut is not a message action.");
      return;
    }

    const channelId = payload.channel.id;
    const channelInfo = await context.client.conversations.info({
      channel: channelId,
    });
    if (!channelInfo.ok || !channelInfo.channel?.is_member) {
      await context.client.views.open(getRequestingAdditionView(body.trigger_id, context.botUserId));
      return;
    }
    const message = payload.message;
    const targetTs = message.ts ?? message.thread_ts;
    const permalink =
      (
        await context.client.chat
          .getPermalink({
            channel: channelId,
            message_ts: targetTs,
          })
          .catch((e) => {
            console.error("Failed to get permalink:", e);
            return null;
          })
      )?.permalink ?? null;

    const metadata = JSON.stringify({ channelId, targetTs, permalink });
    await context.client.views.open(getIntroductionView(body.trigger_id, metadata));
  });
}
