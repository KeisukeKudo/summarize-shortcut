import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import shortcutHandler from "./shortcut-handler";
import viewHandler from "./view-handler";
import { GoogleCloudProjectEnv } from "./utils/summarizer";

export default {
  async fetch(request: Request, env: SlackEdgeAppEnv & GoogleCloudProjectEnv, ctx: ExecutionContext): Promise<Response> {
    const app = new SlackApp({ env });
    shortcutHandler(app);
    viewHandler(app);
    return await app.run(request, ctx);
  },
};
