# LlamaSwap Widget

Privy-compatible React swap widget inspired by the open-source LlamaSwap
interface.

Credit: this project is based on ideas and adapter behavior from
[`bgd-labs/llamaswap-interface`](https://github.com/bgd-labs/llamaswap-interface),
the open-source interface behind LlamaSwap/DefiLlama Swap.

This package is intentionally not a clone of the full `llamaswap-interface`
Next app. It keeps the host application's wallet provider and uses the host
wagmi v2 context, so embedded wallets such as Privy can sign approvals and swap
transactions in the same origin as the dapp.

## Status

Early scaffold. The first supported direct adapter is Odos because it can quote
and assemble executable swap transactions from public endpoints without a
DefiLlama API key.

## Install

```bash
npm install llamaswap-widget
```

The package expects the host app to already provide:

- React
- wagmi v2
- viem
- TanStack Query, if wagmi is configured with it

## Usage

```tsx
import {
  LlamaSwapWidget,
  NATIVE_TOKEN_ADDRESS,
  createDefiLlamaProxyAdapter,
  createOdosAdapter,
} from "llamaswap-widget";
import "llamaswap-widget/styles.css";

const ldy = {
  chainId: 8453,
  address: "0x055d20a70eFd45aB839Ae1A39603D0cFDBDd8a13",
  symbol: "LDY",
  decimals: 18,
};

const eth = {
  chainId: 8453,
  address: NATIVE_TOKEN_ADDRESS,
  symbol: "ETH",
  decimals: 18,
};

export function SwapPage() {
  return (
    <LlamaSwapWidget
      fromToken={eth}
      toToken={ldy}
      adapters={[createOdosAdapter()]}
      defaultAmount="0.01"
      slippagePercent="0.5"
    />
  );
}
```

## Optional DefiLlama Proxy Adapter

DefiLlama's own interface proxies some aggregator calls through
`swap-api.defillama.com`. That path is useful for adapters that need API keys or
server-side submission, but it should be treated as optional for this widget.

```tsx
const adapters = [
  createOdosAdapter(),
  createDefiLlamaProxyAdapter({
    protocol: "Matcha",
    apiKey: import.meta.env.VITE_LLAMASWAP_DEFILLAMA_API_KEY,
    proxyUrl: import.meta.env.VITE_LLAMASWAP_PROXY_URL,
  }),
];
```

If you do not have a DefiLlama API key, omit the proxy adapter and use direct
adapters such as Odos.

## Environment

Copy `.env.example` when building a demo app or backend proxy:

```bash
cp .env.example .env
```

Current optional variables:

- `VITE_LLAMASWAP_DEFILLAMA_API_KEY`
- `VITE_LLAMASWAP_PROXY_URL`
- `OX_API_KEY`
- `INCH_API_KEY`
- `HASHFLOW_API_KEY`

## Design Goals

- No iframe.
- No RainbowKit dependency.
- No internal wagmi provider.
- Compatible with Privy embedded wallets through the host app's wagmi context.
- Adapter code is separate from the UI.
- API-key-backed adapters are opt-in.

## What Is Ported

From `bgd-labs/llamaswap-interface`, this package currently ports the same
high-level swap model and the Odos adapter behavior:

1. Build a quote request.
2. Fetch a route.
3. Assemble transaction data.
4. Approve the route spender when needed.
5. Send the swap transaction with the connected wallet.

The full LlamaSwap app includes many more adapters and warnings. Those should be
ported one by one, with tests, instead of copying the full app stack.

## License

GPL-3.0-or-later.

Because parts of this package are adapted from
`bgd-labs/llamaswap-interface`, this package keeps the same GPL-3.0-or-later
license family and includes attribution in `NOTICE`.
