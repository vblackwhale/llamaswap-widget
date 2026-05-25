import { useCallback, useEffect, useState } from 'react';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import ThemeProvider from '../Theme';
import { AggregatorContainer } from '../components/Aggregator';
import {
	fallbackPopularTokens,
	flattenTokenList,
	getOriginalTokenList,
	nativeTokens,
	withOriginalLogoFallback
} from './tokenList';
import { ApiKeysProvider } from './ApiKeys';
import { WidgetRouterProvider } from './WidgetRouter';
import type { LlamaSwapWidgetProps, SwapToken } from './types';

export function LlamaSwapWidget({
	fromToken,
	toToken,
	defaultFromToken,
	defaultToToken,
	defaultAmount,
	tokens,
	slippagePercent = '0.5',
	features,
	className,
	style,
	apiKeys,
	wallet,
	walletAddress,
	isWalletConnected,
	walletChainId,
	onConnect,
	onSwitchChain,
	onSwapSubmitted,
	onSwapConfirmed
}: LlamaSwapWidgetProps) {
	const [tokenList, setTokenList] = useState<Record<string, SwapToken[]>>(() =>
		groupTokens([...fallbackPopularTokens, ...(tokens ?? []), fromToken, toToken, defaultFromToken, defaultToToken])
	);

	const hydrateOriginalTokenList = useCallback(
		(isMounted: () => boolean) => {
			getOriginalTokenList()
				.then((originalTokenList) => {
					if (!isMounted()) return;
					const extraTokens = [fromToken, toToken, defaultFromToken, defaultToToken, ...(tokens ?? [])].filter(
						Boolean
					) as SwapToken[];

					setTokenList(
						mergeTokenLists(
							groupTokens(fallbackPopularTokens),
							mergeTokenLists(originalTokenList, groupTokens(extraTokens))
						)
					);
				})
				.catch(() => {
					if (!isMounted()) return;
					setTokenList(
						groupTokens([
							...(tokens ?? []),
							...nativeTokens,
							...fallbackPopularTokens,
							fromToken,
							toToken,
							defaultFromToken,
							defaultToToken
						])
					);
				});
		},
		[tokens, fromToken, toToken, defaultFromToken, defaultToToken]
	);

	useEffect(() => {
		let isMounted = true;

		hydrateOriginalTokenList(() => isMounted);

		return () => {
			isMounted = false;
		};
	}, [hydrateOriginalTokenList]);

	const handleChainChange = useCallback(() => {
		setTokenList((currentTokenList) => mergeTokenLists(currentTokenList, groupTokens(fallbackPopularTokens)));
		hydrateOriginalTokenList(() => true);
	}, [hydrateOriginalTokenList]);

	const initialFromToken = fromToken ?? defaultFromToken;
	const initialToToken = toToken ?? defaultToToken;
	const effectiveWalletAddress = wallet?.address ?? walletAddress;
	const effectiveWalletConnected = wallet?.isConnected ?? isWalletConnected;
	const effectiveWalletChainId = wallet?.chainId ?? walletChainId;
	const effectiveOnConnect = wallet?.connect ?? onConnect;
	const effectiveOnSwitchChain = wallet?.switchChain ?? onSwitchChain;

	return (
		<ChakraProvider resetCSS={false}>
			<DarkMode>
				<ThemeProvider>
					<ApiKeysProvider apiKeys={apiKeys}>
						<WidgetRouterProvider defaultFromToken={initialFromToken} defaultToToken={initialToToken}>
							<section className={['llamaswap-widget', className].filter(Boolean).join(' ')} style={style}>
								<AggregatorContainer
									tokenList={tokenList as any}
									sandwichList={{}}
									defaultSlippage={slippagePercent}
									defaultAmount={defaultAmount}
									features={features}
									apiKeys={apiKeys}
									walletAddress={effectiveWalletAddress}
									isWalletConnected={effectiveWalletConnected}
									walletChainId={effectiveWalletChainId}
									onConnect={effectiveOnConnect}
									onSwitchChain={effectiveOnSwitchChain}
									walletSendTransaction={wallet?.sendTransaction}
									sponsorTransactions={wallet?.sponsorTransactions}
									onChainChange={handleChainChange}
									onSwapSubmitted={onSwapSubmitted}
									onSwapConfirmed={onSwapConfirmed}
								/>
							</section>
						</WidgetRouterProvider>
					</ApiKeysProvider>
				</ThemeProvider>
			</DarkMode>
		</ChakraProvider>
	);
}

function mergeTokenLists(base: Record<string, SwapToken[]>, extra: Record<string, SwapToken[]>) {
	const merged = { ...base };

	for (const [chainId, chainTokens] of Object.entries(extra)) {
		merged[chainId] = dedupeTokens([...(merged[chainId] ?? []), ...(chainTokens ?? [])]);
	}

	return merged;
}

function groupTokens(tokens: Array<SwapToken | undefined>) {
	return dedupeTokens([
		...nativeTokens,
		...tokens.filter(Boolean).map((token) => withOriginalLogoFallback(token as SwapToken))
	]).reduce<Record<string, SwapToken[]>>((all, token) => {
		const chainId = String(token.chainId);
		all[chainId] = [
			...(all[chainId] ?? []),
			{
				...token,
				label: token.symbol,
				value: token.address,
				geckoId: null
			} as SwapToken
		];
		return all;
	}, {});
}

function dedupeTokens(tokens: SwapToken[]) {
	const seen = new Set<string>();
	const result: SwapToken[] = [];

	for (const token of flattenTokenList(groupByChain(tokens))) {
		const key = `${token.chainId}:${token.address.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(token);
	}

	return result;
}

function groupByChain(tokens: SwapToken[]) {
	return tokens.reduce<Record<string, SwapToken[]>>((all, token) => {
		const chainId = String(token.chainId);
		all[chainId] = [...(all[chainId] ?? []), token];
		return all;
	}, {});
}
