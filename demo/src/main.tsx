import './polyfills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { createConfig, useSetActiveWallet, WagmiProvider } from '@privy-io/wagmi';
import { useEffect, useMemo } from 'react';
import { http, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arbitrum, base, mainnet, optimism, polygon } from 'wagmi/chains';
import type { Address } from 'viem';
import { LlamaSwapWidget, NATIVE_TOKEN_ADDRESS, createOdosAdapter } from '../../src';
import '../../src/styles.css';
import './styles.css';

const supportedChains = [mainnet, base, arbitrum, optimism, polygon] as const;

const config = createConfig({
	chains: supportedChains,
	connectors: [injected({ shimDisconnect: true })],
	transports: {
		[mainnet.id]: http(),
		[base.id]: http(),
		[arbitrum.id]: http(),
		[optimism.id]: http(),
		[polygon.id]: http()
	},
	multiInjectedProviderDiscovery: true
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1
		}
	}
});

const env = (import.meta as any).env;
const privyAppId = env.VITE_PRIVY_APP_ID;
const privyClientId = env.VITE_PRIVY_CLIENT_ID;
const walletConnectProjectId = env.VITE_WALLETCONNECT_PROJECT_ID;
const hasPrivyConfig = Boolean(privyAppId && privyClientId);
const widgetApiKeys = {
	defillama: env.VITE_LLAMASWAP_DEFILLAMA_API_KEY || undefined,
	defillamaProxyUrl: env.VITE_LLAMASWAP_PROXY_URL || undefined,
	zeroX: env.VITE_LLAMASWAP_ZEROX_API_KEY || undefined,
	oneInch: env.VITE_LLAMASWAP_ONEINCH_API_KEY || undefined,
	hashflow: env.VITE_LLAMASWAP_HASHFLOW_API_KEY || undefined
};

const eth = {
	chainId: 8453,
	address: NATIVE_TOKEN_ADDRESS,
	name: 'Ethereum',
	symbol: 'ETH',
	decimals: 18,
	logoURI: 'https://icons.llamao.fi/icons/chains/rsz_ethereum?w=48&h=48'
} as const;

const usdc = {
	chainId: 8453,
	address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
	name: 'USD Coin',
	symbol: 'USDC',
	decimals: 6,
	logoURI: 'https://token-icons.llamao.fi/icons/tokens/8453/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913?h=48&w=48'
} as const;

function PrivyWalletControls() {
	const { authenticated, login, logout, ready, user } = usePrivy();
	const { wallets } = useWallets();
	const activeWallet = wallets[0];
	const address = activeWallet?.address ?? user?.wallet?.address;

	if (authenticated && address) {
		return (
			<div className="demo-wallet">
				<span>
					{address.slice(0, 6)}...{address.slice(-4)}
				</span>
				<button type="button" onClick={() => logout()}>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<button type="button" className="demo-connect" disabled={!ready} onClick={() => login()}>
			{ready ? 'Connect with Privy' : 'Loading Privy...'}
		</button>
	);
}

function Demo() {
	const { authenticated, login, user } = usePrivy();
	const { wallets, ready: walletsReady } = useWallets();
	const { setActiveWallet } = useSetActiveWallet();
	const { address: wagmiAddress } = useAccount();
	const chainId = useChainId();
	const { switchChainAsync } = useSwitchChain();

	const activeWallet = useMemo(() => {
		const linkedAddresses = user?.linkedAccounts
			?.filter((account: any) => account.type !== 'privy')
			.map((account: any) => account.address?.toLowerCase());

		const linkedWallets = wallets.filter((wallet) => linkedAddresses?.includes(wallet.address?.toLowerCase()));

		return linkedWallets.find((wallet) => wallet.walletClientType === 'privy') ?? linkedWallets[0] ?? wallets[0];
	}, [user?.linkedAccounts, wallets]);

	useEffect(() => {
		if (!walletsReady || !activeWallet) return;
		setActiveWallet(activeWallet);
	}, [activeWallet, setActiveWallet, walletsReady]);

	const privyAddress = (activeWallet?.address ?? user?.wallet?.address ?? wagmiAddress) as Address | undefined;

	return (
		<main className="demo-shell">
			<header className="demo-header">
				<div>
					<h1>LlamaSwap Widget Demo</h1>
					<p>Local React integration shell with Privy embedded wallet wiring.</p>
				</div>
				<PrivyWalletControls />
			</header>

			<section className="demo-grid">
				<LlamaSwapWidget
					defaultFromToken={usdc}
					defaultToToken={eth}
					adapters={[createOdosAdapter()]}
					defaultAmount="0.1"
					slippagePercent="0.1"
					apiKeys={widgetApiKeys}
					wallet={{
						address: privyAddress,
						isConnected: authenticated && !!privyAddress,
						chainId,
						connect: () => login(),
						switchChain: async (nextChainId) => {
							await activeWallet?.switchChain(nextChainId);
							await switchChainAsync({ chainId: nextChainId });
						}
					}}
					features={{
						walletControls: true,
						routePanel: true,
						routeRefresh: true,
						slippage: true,
						tokenSwitch: true,
						faqs: false,
						betaWarning: false
					}}
				/>
			</section>
		</main>
	);
}

function MissingPrivyConfig() {
	return (
		<main className="demo-shell">
			<section className="demo-panel">
				<h1>Privy demo config missing</h1>
				<p>
					Set <code>VITE_PRIVY_APP_ID</code>, <code>VITE_PRIVY_CLIENT_ID</code>, and optionally{' '}
					<code>VITE_WALLETCONNECT_PROJECT_ID</code> in <code>.env</code>, then restart <code>npm run dev</code>.
				</p>
			</section>
		</main>
	);
}

createRoot(document.getElementById('root')!).render(
	hasPrivyConfig ? (
		<PrivyProvider
			appId={privyAppId}
			clientId={privyClientId}
			config={{
				defaultChain: base,
				supportedChains: [...supportedChains],
				walletConnectCloudProjectId: walletConnectProjectId,
				embeddedWallets: {
					ethereum: {
						createOnLogin: 'users-without-wallets'
					}
				},
				loginMethods: ['email', 'wallet'],
				appearance: {
					showWalletLoginFirst: false,
					theme: 'light',
					walletChainType: 'ethereum-only'
				}
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={config}>
					<Demo />
				</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	) : (
		<MissingPrivyConfig />
	)
);
