export const redirectQuoteReq = async (
	protocol: string,
	chain: string,
	from: string,
	to: string,
	amount: string,
	extra: any
) => {
	const apiKey = extra?.apiKeys?.defillama;
	const proxyUrl = extra?.apiKeys?.defillamaProxyUrl;
	const url =
		proxyUrl ??
		`https://swap-api.defillama.com/dexAggregatorQuote?protocol=${encodeURIComponent(
			protocol
		)}&chain=${chain}&from=${from}&to=${to}&amount=${amount}${apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : ''}`;

	const body = proxyUrl
		? JSON.stringify({ protocol, chain, from, to, amount, extra })
		: JSON.stringify(extra);

	const data = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body
	}).then((res) => res.json());

	return data;
};

interface SwapEvent {
	user: string;
	aggregator: string;
	isError: boolean;
	chain: string;
	from: string;
	to: string;
	quote: any;
	txUrl: string;
	amount: string;
	errorData: any;
	amountUsd: number;
	slippage: string;
	routePlace: string;
	route: any;
	reportedOutput?: number;
	realOutput?: number;
}

export const sendSwapEvent = async (event: SwapEvent) => {
	const data = await fetch(`https://llamaswap-stats.llama.fi/saveEvent`, {
		method: 'POST',
		body: JSON.stringify(event)
	}).then((res) => res.json());

	return data;
};
