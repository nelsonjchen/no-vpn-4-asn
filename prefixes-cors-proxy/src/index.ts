/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// Parse the URL
		const url = new URL(request.url);
		const path = url.pathname;
		// Use the first element after the slash as the ASN. Ignore the rest.
		const [, asn] = path.split("/");

		if (!asn) {
			return new Response("Please provide an ASN.", { status: 400 });
		}
		// Fetch prefixes for an ASN from bgpview.io

		// Fetch data from bgpview.io
		const bgpviewUrl = `https://api.bgpview.io/asn/${asn}/prefixes`;
		const bgpviewResponse = await fetch(bgpviewUrl);
		if (!bgpviewResponse.ok) {
			return new Response("Failed to fetch data from bgpview.io.", {
				status: 500,
			});
		}
		const bgpviewData = await bgpviewResponse.json();

		return new Response(JSON.stringify(bgpviewData), {
			headers: {
				"content-type": "application/json",
				"access-control-allow-origin": "*",
			},
		});
	}
};
