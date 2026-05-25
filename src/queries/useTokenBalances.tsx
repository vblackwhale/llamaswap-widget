import { useQuery } from '@tanstack/react-query';
import type { LlamaSwapApiKeys } from '../widget/types';

type Balances = Record<string, any>;

const getBalances = async (address, chain, apiKeys?: LlamaSwapApiKeys) => {
	if (!address || !chain) return [];
	if (!apiKeys?.tokenBalancesUrl) return {};

	const url = new URL(apiKeys.tokenBalancesUrl);
	url.searchParams.set('chainId', String(chain));
	url.searchParams.set('address', address);

	const balances: any = await fetch(url.toString()).then((r) => r.json());
	const items = Array.isArray(balances?.data?.items) ? balances.data.items : Array.isArray(balances?.items) ? balances.items : [];

	return items.reduce((all: Balances, t: any) => {
		const address =
			t.contract_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
				? '0x0000000000000000000000000000000000000000'
				: t.contract_address;
		all[address.toLowerCase()] = {
			decimals: t.contract_decimals,
			symbol: t.contract_ticker_symbol ?? 'UNKNOWN',
			price: t.quote_rate,
			amount: t.balance,
			balanceUSD: t.quote ?? 0
		};
		return all;
	}, {} as Balances);
};

export const useTokenBalances = (address, chain, apiKeys?: LlamaSwapApiKeys) => {
	return useQuery<Balances>({
		queryKey: ['balances', address, chain, apiKeys?.tokenBalancesUrl],
		queryFn: () => getBalances(address, chain, apiKeys),
		enabled: !!address && !!chain && !!apiKeys?.tokenBalancesUrl,
		initialData: {},
		staleTime: 60 * 1000
	});
};
