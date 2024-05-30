import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";

describe("Worker", () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev("src/index.ts", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	it("should return CORS * JSON for cloudflare's prefix", async () => {
		const resp = await worker.fetch("http://localhost:8787/13335");
		if (resp) {
			// Check if the header allows CORS
			expect(resp.headers.get("access-control-allow-origin")).toBe("*");
			// Check if it's JSON
			const json = await resp.json() as any;
			expect(json).toBeDefined();
			if (!json) return;
			// CHeck if the first element has a prefix
			expect(json.status).toBe("ok");
		}
	});
});
