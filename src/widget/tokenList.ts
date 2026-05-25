import type { Address } from 'viem';
import { NATIVE_TOKEN_ADDRESS } from './tokens';
import type { SwapToken } from './types';

const TOKEN_LIST_URL = 'https://d3g10bzo9rdluh.cloudfront.net/tokenlists.json';
const ICONS_CDN = 'https://icons.llamao.fi/icons';
let originalTokenListPromise: Promise<Record<string, LlamaToken[]>> | null = null;

export interface LlamaToken extends SwapToken {
	label?: string;
	value?: string;
	logoURI2?: string;
	volume24h?: number;
	isMultichain?: boolean;
}

export const nativeTokens: LlamaToken[] = [
	nativeToken(1, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(10, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(56, 'Binance', 'BNB', 'binance'),
	nativeToken(137, 'Matic', 'MATIC', 'polygon'),
	nativeToken(250, 'Fantom', 'FTM', 'fantom'),
	nativeToken(324, 'zkSync Era', 'ETH', 'zksync era'),
	nativeToken(8453, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(42161, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(43114, 'Avalanche', 'AVAX', 'avax'),
	nativeToken(59144, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(100, 'xDai', 'xDAI', 'gnosis'),
	nativeToken(8217, 'Klaytn', 'KLAY', 'klaytn'),
	nativeToken(1313161554, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(42220, 'Celo', 'CELO', 'celo'),
	nativeToken(25, 'Cronos', 'CRO', 'cronos'),
	nativeToken(2000, 'Dogechain', 'DOGE', 'dogechain'),
	nativeToken(1285, 'Moonriver', 'MOVR', 'moonriver'),
	nativeToken(42262, 'Oasis', 'ROSE', 'oasis'),
	nativeToken(106, 'Velas', 'VLX', 'velas'),
	nativeToken(128, 'Huobi Token', 'HT', 'heco'),
	nativeToken(1666600000, 'Harmony', 'ONE', 'harmony'),
	nativeToken(288, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(66, 'OKT', 'OKT', 'okexchain'),
	nativeToken(122, 'Fuse', 'FUSE', 'fuse'),
	nativeToken(1284, 'Moonbeam', 'GLMR', 'moonbeam'),
	nativeToken(7700, 'Canto', 'CANTO', 'canto'),
	nativeToken(1101, 'Ethereum', 'ETH', 'ethereum'),
	nativeToken(58, 'Ontology', 'ONG', 'ontologyevm'),
	nativeToken(2222, 'Kava', 'KAVA', 'kava'),
	nativeToken(369, 'Pulse', 'PLS', 'pulse'),
	nativeToken(1088, 'Metis', 'METIS', 'metis')
];

export const fallbackPopularTokens: LlamaToken[] = [
	token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'USD Coin', 'USDC', 6),
	token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'Tether USD', 'USDT', 6),
	token(1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 'Wrapped BTC', 'WBTC', 8),
	token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'Wrapped Ether', 'WETH', 18),
	token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 'Dai Stablecoin', 'DAI', 18),
	token(1, '0x514910771AF9Ca656af840dff83E8264EcF986CA', 'ChainLink Token', 'LINK', 18),
	token(1, '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 'Polygon', 'MATIC', 18),
	token(1, '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F', 'Synthetix Network Token', 'SNX', 18),
	token(1, '0xD533a949740bb3306d119CC777fa900bA034cd52', 'Curve DAO Token', 'CRV', 18),
	token(1, '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', 'Coinbase Wrapped Staked ETH', 'cbETH', 18),
	token(1, '0xae78736Cd615f374D3085123A210448E74Fc6393', 'Rocket Pool ETH', 'rETH', 18),
	token(56, '0x55d398326f99059fF775485246999027B3197955', 'Tether USD', 'USDT', 18),
	token(56, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 'USD Coin', 'USDC', 18),
	token(56, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 'Ethereum Token', 'ETH', 18),
	token(56, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 'BTCB Token', 'BTCB', 18),
	token(56, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 'BUSD Token', 'BUSD', 18),
	token(56, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 'Dai Token', 'DAI', 18),
	token(43114, '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 'USD Coin', 'USDC', 6),
	token(43114, '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', 'Tether USD', 'USDT', 6),
	token(43114, '0x50b7545627a5162F82A992c33b87aDc75187B218', 'Wrapped BTC', 'WBTC', 8),
	token(43114, '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 'Wrapped Ether', 'WETH.e', 18),
	token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'Wrapped AVAX', 'WAVAX', 18),
	token(250, '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 'USD Coin', 'USDC', 6),
	token(250, '0x049d68029688eAbF473097a2fC38ef61633A3C7A', 'Frapped USDT', 'fUSDT', 6),
	token(250, '0x321162Cd933E2Be498Cd2267a90534A804051b11', 'Wrapped BTC', 'WBTC', 8),
	token(250, '0x74B23882a30290451A17c44f4F05243b6b58C76d', 'Ethereum', 'ETH', 18),
	token(250, '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', 'Wrapped Fantom', 'WFTM', 18),
	token(8453, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'USD Coin', 'USDC', 6),
	token(8453, '0x4200000000000000000000000000000000000006', 'Wrapped Ether', 'WETH', 18),
	token(8453, '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 'Tether USD', 'USDT', 6),
	token(8453, '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 'USD Base Coin', 'USDbC', 6),
	token(8453, '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 'Dai Stablecoin', 'DAI', 18),
	token(8453, '0xcbB7C0000aB88B473b1f5aFD9ef808440eed33Bf', 'Coinbase Wrapped BTC', 'cbBTC', 8),
	token(8453, '0x940181a94A35A4569E4529A3CDfB74e38FD98631', 'Aerodrome', 'AERO', 18),
	token(42161, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 'USD Coin', 'USDC', 6),
	token(42161, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 'USD Coin', 'USDC.e', 6),
	token(42161, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 'Tether USD', 'USDT', 6),
	token(42161, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 'Wrapped BTC', 'WBTC', 8),
	token(42161, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 'Wrapped Ether', 'WETH', 18),
	token(42161, '0x912CE59144191C1204E64559FE8253a0e49E6548', 'Arbitrum', 'ARB', 18),
	token(10, '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 'USD Coin', 'USDC', 6),
	token(10, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 'USD Coin', 'USDC.e', 6),
	token(10, '0x94b008aD8E0a071F3B5888528bF91d5C8bC6CbB', 'Tether USD', 'USDT', 6),
	token(10, '0x68f180fcCe6836688e9084f035309E29Bf0A2095', 'Wrapped BTC', 'WBTC', 8),
	token(10, '0x4200000000000000000000000000000000000006', 'Wrapped Ether', 'WETH', 18),
	token(10, '0x4200000000000000000000000000000000000042', 'Optimism', 'OP', 18),
	token(137, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 'USD Coin', 'USDC', 6),
	token(137, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 'Tether USD', 'USDT', 6),
	token(137, '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 'Wrapped BTC', 'WBTC', 8),
	token(137, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 'Wrapped Ether', 'WETH', 18),
	token(137, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 'Dai Stablecoin', 'DAI', 18),
	token(100, '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', 'USD Coin', 'USDC', 6),
	token(100, '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', 'Tether USD', 'USDT', 6),
	token(100, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 'Wrapped Ether', 'WETH', 18),
	token(100, '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252', 'Wrapped BTC', 'WBTC', 8),
	token(8217, '0x6270B58BE569a7c0b8f47594F191631Ae5b2C86C', 'USD Coin', 'USDC', 6),
	token(8217, '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167', 'Klaytn Dai', 'KDAI', 18),
	token(1313161554, '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', 'USD Coin', 'USDC', 6),
	token(1313161554, '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', 'Wrapped Ether', 'WETH', 18),
	token(42220, '0x765DE816845861e75A25fCA122bb6898B8B1282a', 'Celo Dollar', 'cUSD', 18),
	token(42220, '0x471EcE3750Da237f93B8E339c536989b8978a438', 'Celo native asset', 'CELO', 18),
	token(25, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', 'USD Coin', 'USDC', 6),
	token(25, '0x062E66477Faf219F25D27dCED647BF57C3107d52', 'Wrapped BTC', 'WBTC', 8),
	token(25, '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', 'Wrapped Ether', 'WETH', 18),
	token(1285, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 'USD Coin', 'USDC', 6),
	token(1285, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 'Wrapped MOVR', 'WMOVR', 18),
	token(42262, '0x21C718C22D52d0F3a789b752D4c2F334d0F9dD9e', 'Wrapped ROSE', 'WROSE', 18),
	token(128, '0xa71EdC38d189767582C38A3145b5873052c3e47a', 'Tether USD', 'USDT', 18),
	token(1666600000, '0x985458e523db3d53125813ed68c274899e9dfab4', 'USD Coin', 'USDC', 6),
	token(1666600000, '0x6983D1E6DEf3690C4d616b13597A09e6193EA013', 'Wrapped Ether', '1ETH', 18),
	token(288, '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc', 'USD Coin', 'USDC', 6),
	token(288, '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', 'Wrapped Ether', 'WETH', 18),
	token(66, '0x382bb369d343125bfb2117af9c149795c6c65c50', 'Tether USD', 'USDT', 18),
	token(122, '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5', 'USD Coin', 'USDC', 6),
	token(1284, '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', 'USD Coin', 'USDC', 6),
	token(7700, '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B', 'Note', 'NOTE', 18),
	token(324, '0x1d17CBcF0D0fDa6af71bc85b61e02dA098F4eB9C', 'USD Coin', 'USDC', 6),
	token(1101, '0xA8CE8aee21bc2A48a5e25f0A1eC2C3C0A4fE5eAa', 'USD Coin', 'USDC', 6),
	token(2222, '0x919C1c267BC06a7039e03fcc2eF738525769109c', 'Tether USD', 'USDT', 6),
	token(2222, '0xFA9343C3897324496a05FC75abed6B0f8F3eA6F0', 'USD Coin', 'USDC', 6),
	token(1088, '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', 'USD Coin', 'USDC', 6),
	token(1088, '0x420000000000000000000000000000000000000A', 'Wrapped Ether', 'WETH', 18),
	token(59144, '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', 'USD Coin', 'USDC', 6),
	token(59144, '0xA219439258ca9da29E9Cc4cE5596924745e12B93', 'Tether USD', 'USDT', 6),
	token(59144, '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 'Wrapped Ether', 'WETH', 18)
];

export const quickSuggestionSymbolsByChainId: Record<number, string[]> = {
	1: ['ETH', 'USDC', 'USDT', 'WBTC', 'WETH'],
	10: ['ETH', 'USDC', 'USD₮0', 'WBTC', 'OP'],
	56: ['BNB', 'USDT', 'USDC', 'BTCB', 'ETH'],
	137: ['POL', 'USDC', 'USDT', 'WBTC', 'WETH'],
	250: ['FTM', 'USDC', 'axlUSDC', 'WBTC', 'WFTM'],
	324: ['ETH', 'USDC.e', 'USDT', 'WBTC', 'WETH'],
	8453: ['ETH', 'USDC', 'USDT', 'cbBTC', 'WETH'],
	42161: ['ETH', 'USDC', 'USDT', 'WBTC', 'WETH'],
	43114: ['AVAX', 'USDC', 'USDt', 'BTC.b', 'WAVAX'],
	59144: ['ETH', 'USDC', 'USDT', 'WBTC', 'WETH'],
	100: ['xDai', 'USDC', 'USDT', 'WBTC', 'WETH'],
	8217: ['KLAY', 'USDC', 'KDAI', 'WBTC', 'WETH'],
	1313161554: ['ETH', 'USDC', 'WETH'],
	42220: ['CELO', 'USDC', 'cUSD', 'USDT', 'WETH'],
	25: ['CRO', 'USDC', 'USDT', 'WBTC', 'WETH'],
	2000: ['DOGE', 'USDC', 'USDT', 'WBTC', 'WETH'],
	1285: ['MOVR', 'USDC', 'FRAX', 'WBTC', 'WMOVR'],
	42262: ['ROSE', 'USDC', 'USDT', 'WROSE'],
	106: ['VLX', 'USDC', 'USDT', 'WBTC', 'ETH'],
	128: ['HT', 'USDT', 'USDC', 'HBTC'],
	1666600000: ['ONE', '1USDC', '1USDT', '1ETH', 'WONE'],
	288: ['ETH', 'USDC', 'USDT', 'BOBA', 'WETH'],
	66: ['OKT', 'USDC', 'USDT', 'BTCK', 'OKB'],
	122: ['FUSE', 'USDC', 'USDT', 'WETH', 'WFUSE'],
	1284: ['GLMR', 'USDC', 'xcUSDT', 'xcIBTC', 'WETH'],
	7700: ['CANTO', 'NOTE', 'USDC', 'USDT'],
	1101: ['ETH', 'USDC.e', 'USDT', 'WBTC', 'WETH'],
	58: ['ONG', 'USDC', 'USDT', 'WBTC'],
	2222: ['KAVA', 'USDt', 'axlUSDC', 'WBTC', 'WKAVA'],
	369: ['PLS', 'USDC', 'USDT', 'WBTC', 'WPLS'],
	1088: ['METIS', 'm.USDC', 'm.USDT', 'WBTC', 'WETH']
};

export async function getOriginalTokenList() {
	if (originalTokenListPromise) return originalTokenListPromise;

	originalTokenListPromise = fetchOriginalTokenList();
	return originalTokenListPromise;
}

async function fetchOriginalTokenList() {
	const response = await fetch(TOKEN_LIST_URL);
	if (!response.ok) throw new Error(`Token list failed with ${response.status}.`);
	const tokenList = (await response.json()) as Record<string, LlamaToken[]>;

	for (const token of nativeTokens) {
		const chainTokens = tokenList[String(token.chainId)] ?? [];
		const hasNative = chainTokens.some((item) => item.address.toLowerCase() === NATIVE_TOKEN_ADDRESS);
		if (!hasNative) tokenList[String(token.chainId)] = [token, ...chainTokens];
	}

	return tokenList;
}

export function flattenTokenList(tokenList: Record<string, LlamaToken[]>) {
	return Object.values(tokenList).flat();
}

export function enrichTokenFromList(token: SwapToken | undefined, tokenList: LlamaToken[]) {
	if (!token) return undefined;
	const match = tokenList.find(
		(item) => item.chainId === token.chainId && item.address.toLowerCase() === token.address.toLowerCase()
	);

	return match ? { ...token, ...match } : withOriginalLogoFallback(token);
}

export function withOriginalLogoFallback(token: SwapToken): LlamaToken {
	if (token.logoURI) return token;
	const native = nativeTokens.find(
		(item) => item.chainId === token.chainId && item.address.toLowerCase() === token.address.toLowerCase()
	);
	if (native) return { ...token, logoURI: native.logoURI, logoURI2: native.logoURI2 };

	return {
		...token,
		logoURI: `https://token-icons.llamao.fi/icons/tokens/${token.chainId}/${token.address}?h=20&w=20`
	};
}

export function chainIconUrl(chain: string) {
	return `${ICONS_CDN}/chains/rsz_${chain.toLowerCase()}?w=48&h=48`;
}

function nativeToken(chainId: number, name: string, symbol: string, icon: string): LlamaToken {
	return {
		chainId,
		address: NATIVE_TOKEN_ADDRESS as Address,
		name,
		symbol,
		decimals: 18,
		logoURI: chainIconUrl(icon),
		label: symbol,
		value: NATIVE_TOKEN_ADDRESS
	};
}

function token(chainId: number, address: string, name: string, symbol: string, decimals: number): LlamaToken {
	return {
		chainId,
		address: address as Address,
		name,
		symbol,
		decimals,
		logoURI: `https://token-icons.llamao.fi/icons/tokens/${chainId}/${address}?h=20&w=20`,
		label: symbol,
		value: address
	};
}
