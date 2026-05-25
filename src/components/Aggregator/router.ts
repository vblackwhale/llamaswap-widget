import { allChains } from '../WalletProvider/chains';
import { chainNamesReplaced } from './constants';
import { adapters } from './list';

export const adaptersNames = adapters.map(({ name }) => name);

const adaptersMap = adapters.reduce((acc, adapter) => ({ ...acc, [adapter.name]: adapter }), {});

export function getAllChains() {
	const chains = new Set<string>();
	for (const adapter of adapters) {
		Object.keys(adapter.chainToId).forEach((chain) => chains.add(chain));
	}

	const chainsOptions = allChains
		.map((c) => {
			const chain = c as any;
			const isVisible = chains.has(chain.network);
			if (!isVisible) return null;
			return {
				value: chain.network,
				label: chainNamesReplaced[chain.network] ?? chain.name,
				chainId: chain.id,
				logoURI: chain?.iconUrl
			};
		})
		.filter(Boolean);
	return chainsOptions;
}

export async function swap({
	chain,
	from,
	to,
	amount,
	signer,
	signTypedDataAsync,
	slippage = '1',
	adapter,
	rawQuote,
	tokens,
	approvalData
}) {
	const aggregator = adaptersMap[adapter];

	try {
		const res = await aggregator.swap({
			chain,
			from,
			to,
			amount,
			signer,
			signTypedDataAsync,
			slippage,
			rawQuote,
			tokens,
			approvalData
		});
		return res;
	} catch (e) {
		throw e;
	}
}
export async function gaslessApprove({ signTypedDataAsync, adapter, rawQuote, isInfiniteApproval }) {
	const aggregator = adaptersMap[adapter];

	if (!aggregator.gaslessApprove) return;

	try {
		const res = await aggregator.gaslessApprove({
			signTypedDataAsync,
			rawQuote,
			isInfiniteApproval
		});
		return res;
	} catch (e) {
		throw e;
	}
}
