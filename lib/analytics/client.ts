import type { AnalyticsEvent, PublicPostHogConfig } from "./types";

interface AnalyticsTransport {
  fetcher?: typeof fetch;
  beacon?: (url: string, data?: BodyInit | null) => boolean;
  preferBeacon?: boolean;
}

function ingestionUrl(host: string) {
  return `${host.replace(/\/+$/, "")}/i/v0/e/`;
}

function payload(config: PublicPostHogConfig, event: AnalyticsEvent) {
  const { event: eventName, timestamp, visitor_id, ...properties } = event;
  return JSON.stringify({
    token: config.token,
    event: eventName,
    timestamp,
    properties: {
      ...properties,
      visitor_id,
      distinct_id: visitor_id,
    },
  });
}

export function sendAnalyticsEvent(
  config: PublicPostHogConfig | null,
  event: AnalyticsEvent,
  transport: AnalyticsTransport = {},
) {
  if (!config?.token || !config.host) return;

  const url = ingestionUrl(config.host);
  const body = payload(config, event);
  if (transport.preferBeacon && transport.beacon) {
    transport.beacon(
      url,
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  const fetcher = transport.fetcher ?? globalThis.fetch;
  if (!fetcher) return;
  void fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
