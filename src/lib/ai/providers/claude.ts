import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import type { AIProvider } from "../types";

/**
 * Anthropic Claude provider (default). Uses the official SDK's streaming API.
 * The model id comes from AI_MODEL (default `claude-opus-4-8`) and is fully
 * operator-configurable. Adaptive thinking is opt-in via AI_THINKING — kept off
 * by default so the public chat widget responds quickly.
 *
 * Works against Anthropic's API or Claude Platform on AWS. The AWS platform
 * serves the same Messages API from a regional endpoint (ANTHROPIC_BASE_URL)
 * with a key generated in the AWS console, and routes every request by the
 * workspace named in the `anthropic-workspace-id` header.
 */
export function createClaudeProvider(): AIProvider {
  const { anthropicApiKey: apiKey, anthropicBaseUrl: baseURL, anthropicWorkspaceId: workspaceId } =
    config.ai;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Configure it in .env or switch AI_PROVIDER."
    );
  }
  checkClaudeOnAws(apiKey, baseURL, workspaceId);

  const client = new Anthropic({
    apiKey,
    baseURL,
    defaultHeaders: workspaceId ? { "anthropic-workspace-id": workspaceId } : undefined,
  });

  return {
    name: "claude",
    async *streamChat({ system, messages, model, maxTokens, thinking }) {
      const params: Anthropic.MessageStreamParams = {
        model: model ?? config.ai.model,
        max_tokens: maxTokens ?? config.ai.maxTokens,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };

      // Opt-in adaptive thinking (Opus 4.6+/4.8). The API accepts `adaptive` at
      // runtime; cast keeps us forward-compatible with older SDK typings.
      if (config.ai.thinking && thinking !== false) {
        (params as unknown as Record<string, unknown>).thinking = {
          type: "adaptive",
          display: "summarized",
        };
      }

      const stream = client.messages.stream(params);

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}

/**
 * A Claude Platform on AWS key sent to Anthropic's API, or an AWS request
 * without a workspace, fails with a bare 401 that never says why. Both are
 * one missing environment variable, so name it before the first request.
 */
function checkClaudeOnAws(apiKey: string, baseURL?: string, workspaceId?: string): void {
  const awsEndpoint = baseURL?.includes("aws-external-anthropic") ?? false;

  // Long-term keys generated under Claude Platform on AWS start with AEAA,
  // the way Amazon Bedrock's start with ABSK.
  if (apiKey.startsWith("AEAA") && !awsEndpoint) {
    throw new Error(
      "ANTHROPIC_API_KEY is a Claude Platform on AWS key. Set ANTHROPIC_BASE_URL to " +
        "https://aws-external-anthropic.<region>.api.aws and ANTHROPIC_WORKSPACE_ID to your workspace id."
    );
  }
  if (awsEndpoint && !workspaceId) {
    throw new Error(
      "ANTHROPIC_WORKSPACE_ID is not set. Claude Platform on AWS requires the workspace id " +
        "(wrkspc_…) shown in the AWS console."
    );
  }
}
