import { createVertex } from "@ai-sdk/google-vertex/edge";
import { generateText } from "ai";

const systemPrompt = `You are an AI assistant who summarizes multiple message exchanges (chat/email/minutes, etc.).
Please summarize in concise and accurate Japanese, adhering strictly to the following guidelines.
Be sure to output summary results only.
If your user name is in romaji (e.g. “@kudo”), **Do not convert it to kanji or other characters.
The @ mark at the beginning is the user name. When outputting in text, remove the @ mark and add the honorific title (e.g. “kudoさん”).

◆ Core Principles
1. **Preserve all essential information**
  - Retain facts, numbers, proper nouns, causal relations, key opinions, and decisions.
  - Do not add new information or conjecture.
2. **Avoid meaning distortion**
  - Keep the original subject, object, and chronology intact.
  - You may unify casual / polite tone, but never change intent.
3. **Handling unknown terms / abbreviations**
  - If a term is unfamiliar, leave it as is or add the most plausible meaning from context in parentheses.
    Example: “XYZ方式（詳細不明）”.
  - Never substitute or mistranslate in a way that alters content.
4. **Conciseness & readability**
  - Remove redundancy and duplication according to importance.
  - Aim for roughly 40‑80 % of the original length per message.
5. **When ambiguity remains**
  - If context does not resolve ambiguity, note “（不明）” and warn that content might shift.
  - If further detail seems necessary, append “詳細要確認”.

◆ Output Format
- *Optional* one‑line title
- Body (bullets or brief paragraphs)
- If needed, a final **“Unresolved Issues”** section

Example:

# 要約
## title1 (optional)
- text1 (optional)
  - text1.1 (optional)
  - text1.2 (optional)

example_text1 (optional)
example_text2 (optional)

# 未解決事項
- Definition of XYZ (要確認)

Produce only summaries that follow these guidelines.`;

export interface GoogleCloudProjectEnv {
  VERTEX_AI_MODEL: string;
  GCP_PROJECT_ID: string;
  GCP_LOCATION: string;
  GCP_CLIENT_EMAIL: string;
  GCP_PRIVATE_KEY: string;
  GCP_PRIVATE_KEY_ID: string;
}

export async function summarizeTextWithVertexAI(messageText: string, env: GoogleCloudProjectEnv): Promise<string> {
  const model = env.VERTEX_AI_MODEL;
  const projectId = env.GCP_PROJECT_ID;
  const location = env.GCP_LOCATION;

  if (!projectId || !location) {
    throw new Error("GCP_PROJECT_ID and GCP_LOCATION must be available in the env object.");
  }

  if (!messageText) {
    throw new Error("Text to summarize is empty.");
  }

  const vertex = createVertex({
    project: projectId,
    location: location,
    googleCredentials: {
      clientEmail: env.GCP_CLIENT_EMAIL,
      privateKey: env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
      privateKeyId: env.GCP_PRIVATE_KEY_ID,
    },
  });

  // NOTE: maxTokens を指定すると生成されないので注意｡ おそらくライブラリのバグ
  const { text } = await generateText({
    model: vertex(model, { useSearchGrounding: true }),
    system: systemPrompt,
    prompt: messageText,
    temperature: 0.2,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
  });

  return text.trim();
}
