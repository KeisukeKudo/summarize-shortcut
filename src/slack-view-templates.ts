import { ModalView, ViewAckResponse, ViewsOpenRequest, ViewsUpdateRequest } from "slack-cloudflare-workers";

export function getIntroductionView(triggerId: string, metadata: string | undefined = undefined): ViewsOpenRequest {
  return {
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "summarize-modal",
      title: {
        type: "plain_text",
        text: "Confirmation",
        emoji: true,
      },
      submit: {
        type: "plain_text",
        text: "OK",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true,
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "会話を要約します。よろしいですか？",
          },
        },
      ],
      private_metadata: metadata,
    },
  };
}

export function getProgressView(): ViewAckResponse {
  return {
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "progress-modal",
      title: {
        type: "plain_text",
        text: "Summarizing...",
      },
      close: {
        type: "plain_text",
        text: "Close",
      },
      blocks: [
        {
          type: "section",
          text: { type: "plain_text", text: "要約中です。そのままお待ちください。\nダイアログを閉じても処理は続行されます。" },
        },
      ],
    },
  };
}

export function getRequestingAdditionView(triggerId: string, botUserId: string): ViewsOpenRequest {
  return {
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "summarize-modal",
      title: {
        type: "plain_text",
        text: "Oops! An Error Occurred.",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true,
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `チャンネルに参加していないようです。\n \`/invite <@${botUserId}>\` を実行して、私をチャンネルに招待してくれませんか？`,
          },
        },
      ],
    },
  };
}

export function getErrorView(viewId: string): ViewsUpdateRequest {
  return {
    view_id: viewId,
    view: {
      type: "modal",
      callback_id: "error-modal",
      title: {
        type: "plain_text",
        text: "Oops! An Error Occurred.",
      },
      close: {
        type: "plain_text",
        text: "Close",
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "不明なエラーが発生しました。\nもう一度試すか、担当者に連絡してください。",
          },
        },
      ],
    },
  };
}

export function getDoneView(viewId: string, botUserId: string): ViewsUpdateRequest {
  return {
    view_id: viewId,
    view: {
      type: "modal",
      callback_id: "finished-modal",
      title: {
        type: "plain_text",
        text: "Done!!",
      },
      close: {
        type: "plain_text",
        text: "Close",
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `要約に成功しました！<@${botUserId}> から確認してください！`,
          },
        },
      ],
    },
  };
}
