import { createContext, useContext, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import type { SwapToken } from './types';
import { chainsMap } from '../components/Aggregator/constants';

type WidgetQuery = Record<string, string | undefined>;

interface WidgetRouterValue {
	pathname: string;
	query: WidgetQuery;
	isReady: boolean;
	push: (next: { pathname?: string; query?: WidgetQuery }, as?: unknown, options?: unknown) => Promise<boolean>;
}

const WidgetRouterContext = createContext<WidgetRouterValue | null>(null);

export function WidgetRouterProvider({
	children,
	defaultFromToken,
	defaultToToken
}: {
	children: React.ReactNode;
	defaultFromToken?: SwapToken;
	defaultToToken?: SwapToken;
}) {
	const [query, setQuery] = useState<WidgetQuery>(() => ({
		chain: chainNameFromId(defaultFromToken?.chainId ?? defaultToToken?.chainId) ?? 'ethereum',
		from: defaultFromToken?.address ?? ethers.constants.AddressZero,
		to: defaultToToken?.address
	}));

	const value = useMemo<WidgetRouterValue>(
		() => ({
			pathname: '/',
			query,
			isReady: true,
			push: async (next) => {
				setQuery((current) => ({ ...current, ...(next.query ?? {}) }));
				return true;
			}
		}),
		[query]
	);

	return <WidgetRouterContext.Provider value={value}>{children}</WidgetRouterContext.Provider>;
}

export function useWidgetRouter() {
	const router = useContext(WidgetRouterContext);
	if (!router) throw new Error('useWidgetRouter must be used inside WidgetRouterProvider');
	return router;
}

function chainNameFromId(chainId?: number) {
	if (!chainId) return undefined;
	return Object.entries(chainsMap).find(([, id]) => id === chainId)?.[0];
}
