import type { Address, Hex } from 'viem';
import type { QuoteRequest, SwapAdapter } from '../widget/types';

interface DefiLlamaProxyAdapterOptions {
	protocol: string;
	apiKey?: string;
	proxyUrl?: string;
	supportedChainIds?: number[];
}

interface ProxyQuoteResponse {
	amountReturned?: string;
	estimatedGas?: string | number;
	tokenApprovalAddress?: Address;
	tx?: {
		to: Address;
		data: Hex;
		value?: string;
	};
	transaction?: {
		to: Address;
		data: Hex;
		value?: string;
	};
}

export function createDefiLlamaProxyAdapter({
	protocol,
	apiKey,
	proxyUrl = 'https://swap-api.defillama.com',
	supportedChainIds = [1, 10, 56, 137, 8453, 42161, 43114]
}: DefiLlamaProxyAdapterOptions): SwapAdapter {
	return {
		id: `defillama-${protocol.toLowerCase()}`,
		name: protocol,
		supportedChainIds,
		async getQuote(request: QuoteRequest) {
			const url = new URL('/dexAggregatorQuote', proxyUrl);
			url.searchParams.set('chain', String(request.fromToken.chainId));
			url.searchParams.set('from', request.fromToken.address);
			url.searchParams.set('to', request.toToken.address);
			url.searchParams.set('amount', request.amount.toString());
			url.searchParams.set('slippage', request.slippagePercent);
			url.searchParams.set('userAddress', request.account);
			url.searchParams.set('protocol', protocol);

			const response = await fetch(url, {
				headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
			});
			if (!response.ok) throw new Error(`${protocol} proxy quote failed with ${response.status}.`);

			const data = (await response.json()) as ProxyQuoteResponse;
			const tx = data.tx ?? data.transaction;
			if (!data.amountReturned || !tx) throw new Error(`${protocol} proxy did not return a swap transaction.`);

			return {
				adapterId: `defillama-${protocol.toLowerCase()}`,
				adapterName: protocol,
				amountOut: BigInt(data.amountReturned),
				estimatedGas: data.estimatedGas === undefined ? undefined : BigInt(data.estimatedGas),
				spender: data.tokenApprovalAddress,
				tx: {
					to: tx.to,
					data: tx.data,
					value: BigInt(tx.value || 0)
				},
				raw: data
			};
		}
	};
}
