import type { Address, Hex } from 'viem';
import { isNativeToken } from '../widget/tokens';
import type { QuoteRequest, SwapAdapter } from '../widget/types';

const ODOS_NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';
const REFERRAL_CODE = 2101375859;

const routersByChainId: Record<number, Address> = {
	1: '0xcf5540fffcdc3d510b18bfca6d2b9987b0772559',
	10: '0xca423977156bb05b13a2ba3b76bc5419e2fe9680',
	56: '0x89b8aa89fdd0507a99d334cbe3c808fafc7d850e',
	137: '0x4e3288c9ca110bcc82bf38f09a7b425c095d92bf',
	250: '0xd0c22a5435f4e8e5770c1fafb5374015fc12f7cd',
	324: '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7',
	8453: '0x19ceead7105607cd444f5ad10dd51356436095a1',
	42161: '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13',
	43114: '0x88de50b233052e4fb783d4f6db78cc34fea3e9fc',
	59144: '0x2d8879046f1559E53eb052E949e9544bCB72f414'
};

interface OdosQuoteResponse {
	pathId?: string;
	message?: string;
}

interface OdosAssembleResponse {
	outputTokens?: Array<{ amount: string }>;
	transaction?: {
		to: Address;
		data: Hex;
		value: string;
		gas?: number;
	};
	gasEstimate?: number;
	message?: string;
}

export function createOdosAdapter(): SwapAdapter {
	return {
		id: 'odos',
		name: 'Odos',
		supportedChainIds: Object.keys(routersByChainId).map(Number),
		async getQuote(request) {
			const router = routersByChainId[request.fromToken.chainId];
			if (!router) throw new Error(`Odos does not support chain ${request.fromToken.chainId}.`);

			const quote = await post<OdosQuoteResponse>('https://api.odos.xyz/sor/quote/v2', {
				chainId: request.fromToken.chainId,
				inputTokens: [
					{
						tokenAddress: toOdosTokenAddress(request.fromToken.address),
						amount: request.amount.toString()
					}
				],
				outputTokens: [
					{
						tokenAddress: toOdosTokenAddress(request.toToken.address),
						proportion: 1
					}
				],
				userAddr: request.account,
				slippageLimitPercent: Number(request.slippagePercent),
				referralCode: REFERRAL_CODE,
				disableRFQs: true,
				compact: true
			});

			if (!quote.pathId) throw new Error(quote.message || 'Odos did not return a path.');

			const assembled = await post<OdosAssembleResponse>('https://api.odos.xyz/sor/assemble', {
				userAddr: request.account,
				pathId: quote.pathId
			});

			if (!assembled.transaction || !assembled.outputTokens?.[0]) {
				throw new Error(assembled.message || 'Odos did not return a transaction.');
			}
			if (assembled.transaction.to.toLowerCase() !== router.toLowerCase()) {
				throw new Error('Odos router address did not match the expected chain router.');
			}

			return {
				adapterId: 'odos',
				adapterName: 'Odos',
				amountOut: BigInt(assembled.outputTokens[0].amount),
				estimatedGas: BigInt(assembled.transaction.gas || assembled.gasEstimate || 0),
				spender: isNativeToken(request.fromToken.address) ? undefined : router,
				tx: {
					to: assembled.transaction.to,
					data: assembled.transaction.data,
					value: BigInt(assembled.transaction.value || 0)
				},
				raw: assembled
			};
		}
	};
}

function toOdosTokenAddress(address: Address) {
	return isNativeToken(address) ? ODOS_NATIVE_TOKEN : address;
}

async function post<T>(url: string, body: unknown): Promise<T> {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!response.ok) throw new Error(`Request failed with ${response.status}.`);
	return response.json() as Promise<T>;
}
