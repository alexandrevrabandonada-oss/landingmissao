import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAW_ANCHOR =
  "https://raw.githubusercontent.com/alexandrevrabandonada-oss/landingmissao/ledger-anchor/ledger-anchors/latest.json";

type LedgerHead = {
  id: number;
  entry_hash: string;
  created_at: string;
};

type ExternalAnchor = {
  schema_version: string;
  anchored_at: string;
  source: string;
  verification_page: string;
  algorithm: string;
  ledger_head: LedgerHead;
  anchor_repository: string;
  anchor_branch: string;
};

export async function GET(request: NextRequest) {
  try {
    const ledgerUrl = new URL(
      "/api/climatizacao?action=ledger&limit=1&direction=desc",
      request.nextUrl.origin,
    );

    const [ledgerResponse, anchorResponse] = await Promise.all([
      fetch(ledgerUrl, { cache: "no-store" }),
      fetch(RAW_ANCHOR, {
        cache: "no-store",
        headers: { "User-Agent": "AlexandreVRAbandonada-Climatizacao/1.0" },
      }),
    ]);

    if (!ledgerResponse.ok || !anchorResponse.ok) {
      return Response.json(
        {
          error: "anchor_sources_unavailable",
          ledger_status: ledgerResponse.status,
          anchor_status: anchorResponse.status,
        },
        { status: 502 },
      );
    }

    const ledgerPayload = await ledgerResponse.json();
    const anchor = (await anchorResponse.json()) as ExternalAnchor;
    const current = ledgerPayload?.ledger?.head as LedgerHead | undefined;
    const anchored = anchor?.ledger_head;

    if (!current?.id || !current?.entry_hash || !anchored?.id || !anchored?.entry_hash) {
      return Response.json({ error: "invalid_anchor_payload" }, { status: 502 });
    }

    let comparison:
      | "synchronized"
      | "ledger_ahead"
      | "anchor_ahead"
      | "hash_mismatch";

    if (current.id === anchored.id) {
      comparison =
        current.entry_hash === anchored.entry_hash
          ? "synchronized"
          : "hash_mismatch";
    } else if (current.id > anchored.id) {
      comparison = "ledger_ahead";
    } else {
      comparison = "anchor_ahead";
    }

    const lagEvents = Math.max(0, current.id - anchored.id);
    const healthy = comparison === "synchronized" || comparison === "ledger_ahead";

    return Response.json(
      {
        healthy,
        comparison,
        lag_events: lagEvents,
        current_head: current,
        external_anchor: anchor,
        github: {
          latest_file:
            "https://github.com/alexandrevrabandonada-oss/landingmissao/blob/ledger-anchor/ledger-anchors/latest.json",
          anchor_history:
            "https://github.com/alexandrevrabandonada-oss/landingmissao/commits/ledger-anchor/ledger-anchors",
        },
        generated_at: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error: "anchor_check_failed",
        detail: error instanceof Error ? error.name : "unknown_error",
      },
      { status: 502 },
    );
  }
}
