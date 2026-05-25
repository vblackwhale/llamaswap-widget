import type { CSSProperties } from 'react';
import type { Address, Hex } from 'viem';

export interface SwapToken {
	chainId: number;
	address: Address;
	symbol: string;
	decimals: number;
	name?: string;
	logoURI?: string;
}

export interface SwapTransaction {
	to: Address;
	data: Hex;
	value?: bigint;
}

export interface QuoteRequest {
	account: Address;
	fromToken: SwapToken;
	toToken: SwapToken;
	amount: bigint;
	slippagePercent: string;
}

export interface SwapQuote {
	adapterId: string;
	adapterName: string;
	amountOut: bigint;
	estimatedGas?: bigint;
	spender?: Address;
	tx: SwapTransaction;
	raw?: unknown;
}

export interface SwapAdapter {
	id: string;
	name: string;
	supportedChainIds: number[];
	getQuote(request: QuoteRequest): Promise<SwapQuote>;
}

export interface SwapChain {
	id: number;
	name: string;
	logoURI?: string;
}

export interface LlamaSwapWidgetFeatures {
	walletControls?: boolean;
	routePanel?: boolean;
	routeRefresh?: boolean;
	slippage?: boolean;
	tokenSwitch?: boolean;
	faqs?: boolean;
	settings?: boolean;
	priceImpact?: boolean;
	sandwichWarnings?: boolean;
	betaWarning?: boolean;
	poweredBy?: boolean;
}

export interface LlamaSwapApiKeys {
	defillama?: string;
	defillamaProxyUrl?: string;
	tokenBalancesUrl?: string;
	ox?: string;
	zeroX?: string;
	inch?: string;
	oneInch?: string;
	hashflow?: string;
	eigen?: string;
}

export interface LlamaSwapWalletBridge {
	address?: Address;
	isConnected?: boolean;
	chainId?: number;
	connect?: () => void;
	switchChain?: (chainId: number) => void | Promise<void>;
}

export interface LlamaSwapWidgetProps {
	fromToken?: SwapToken;
	toToken?: SwapToken;
	defaultFromToken?: SwapToken;
	defaultToToken?: SwapToken;
	tokens?: SwapToken[];
	chains?: SwapChain[];
	adapters?: SwapAdapter[];
	defaultAmount?: string;
	slippagePercent?: string;
	apiKeys?: LlamaSwapApiKeys;
	features?: LlamaSwapWidgetFeatures;
	className?: string;
	style?: CSSProperties;
	wallet?: LlamaSwapWalletBridge;
	walletAddress?: Address;
	isWalletConnected?: boolean;
	walletChainId?: number;
	onConnect?: () => void;
	onSwitchChain?: (chainId: number) => void | Promise<void>;
	onTokenSwitch?: (fromToken: SwapToken, toToken: SwapToken) => void;
	onSwapSubmitted?: (hash: string, quote: SwapQuote) => void;
	onSwapConfirmed?: (hash: string, quote: SwapQuote) => void;
}
