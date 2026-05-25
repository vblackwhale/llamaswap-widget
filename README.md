# LlamaSwap Widget

Privy-compatible React swap widget inspired by the open-source LlamaSwap
interface.

Credit: this project is based on ideas and adapter behavior from
[`bgd-labs/llamaswap-interface`](https://github.com/bgd-labs/llamaswap-interface),
the open-source interface behind LlamaSwap/DefiLlama Swap.

This package is intentionally not a clone of the full `llamaswap-interface`
web app. It keeps the host application's wallet provider and uses the host
wagmi v2 context, so embedded wallets such as Privy can sign approvals and swap
transactions in the same origin as the dapp.

## Status

`1.0.0` is the first iframe-to-widget release. It packages the swap experience
as a React component, keeps wallet ownership in the host app, and supports
Privy embedded wallets through the host wagmi context.

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
      defaultFromToken={eth}
      defaultToToken={ldy}
      defaultAmount="0.01"
      slippagePercent="0.5"
      onConnect={() => openPrivyConnectModal()}
    />
  );
}
```

## Widget Features

The widget is swap-only. It does not include the full DefiLlama app navigation
or non-swap sections such as Earn, Borrow, or token-liquidity pages.

Optional controls can be hidden when the host app owns that UI:

```tsx
<LlamaSwapWidget
  defaultFromToken={eth}
  defaultToToken={ldy}
  features={{
    walletControls: false,
    routePanel: true,
    routeRefresh: true,
    slippage: true,
    tokenSwitch: true,
    faqs: false,
    betaWarning: false,
  }}
  style={{ maxWidth: 480 }}
/>
```

`defaultFromToken` and `defaultToToken` are presets. If they are omitted, the
widget renders empty token slots until the host provides a token-selection flow.
The legacy `fromToken` and `toToken` props are still accepted for controlled
host usage.

- `walletControls: false` hides/disables connect-style wallet actions so Privy
  can own wallet UI outside the widget.
- `routePanel: false` keeps a compact swap box and still uses the best quoted
  route.
- `routeRefresh: false` hides the separate refresh button.
- `slippage: false` hides the slippage display.
- `tokenSwitch: false` hides the token switch button.
- `faqs: true` shows the original FAQ section. It is hidden by default.
- `betaWarning: true` shows the beta warning. It is hidden by default.

Use `className` or `style` to override the widget shell without forking the
original swap components.

## Local Development

For a standalone local integration shell:

```bash
npm run dev
```

This starts a minimal Vite React app with wagmi injected-wallet wiring, a
connect button, and a host-styled panel next to the widget to catch style leaks.

When testing inside another Vite dapp through a local file dependency, keep the
host dapp dev server running and use:

```bash
npm run dev:types
```

The type watch script rebuilds `dist`, and the host Vite config should exclude
`llamaswap-widget` from dependency prebundling so changes are picked up without
a full page reload. Restart the host dev server once after changing Vite config.

## Optional DefiLlama Proxy Adapter

DefiLlama's own interface proxies some aggregator calls through
`swap-api.defillama.com`. That path is useful for adapters that need API keys or
server-side submission, but it should be treated as optional for this widget.

```tsx
<LlamaSwapWidget
  apiKeys={{
    defillama: "defillama-api-key",
    defillamaProxyUrl: "https://your-api.example.com/llamaswap",
    zeroX: "0x-api-key",
    oneInch: "1inch-api-key",
    hashflow: "hashflow-api-key",
  }}
/>
```

If neither `defillama` nor `defillamaProxyUrl` is provided, browser-unsafe
routes such as Matcha/0x, 1inch, and 0x Gasless are skipped instead of throwing
CORS errors. Direct browser-safe routes such as Odos still quote normally.

## Environment

Copy `.env.example` when running the local demo:

```bash
cp .env.example .env
```

The widget itself does not read env variables. The local demo reads these
optional adapter values and passes them into `<LlamaSwapWidget apiKeys={...}>`:

- `VITE_LLAMASWAP_DEFILLAMA_API_KEY`
- `VITE_LLAMASWAP_PROXY_URL`
- `VITE_LLAMASWAP_ZEROX_API_KEY`
- `VITE_LLAMASWAP_ONEINCH_API_KEY`
- `VITE_LLAMASWAP_HASHFLOW_API_KEY`

The local Privy demo also uses:

- `VITE_PRIVY_APP_ID`
- `VITE_PRIVY_CLIENT_ID`
- `VITE_WALLETCONNECT_PROJECT_ID` for external wallet testing in the Privy modal

In a host app, pass keys directly through `apiKeys` when needed. Do not rely on
package internals reading `.env`.

## Design Goals

- No iframe.
- No RainbowKit dependency.
- No internal wagmi provider.
- Compatible with Privy embedded wallets through the host app's wagmi context.
- Adapter code is separate from the UI.
- API-key-backed adapters are opt-in.

## What Is Ported

From `bgd-labs/llamaswap-interface`, this package ports the same high-level
swap model and keeps the route/adapter flow inside the widget:

1. Build a quote request.
2. Fetch a route.
3. Assemble transaction data.
4. Approve the route spender when needed.
5. Send the swap transaction with the connected wallet.

The full LlamaSwap app includes app-level pages and navigation that are not part
of this widget package.

## License

GPL-3.0-or-later.

Because parts of this package are adapted from
`bgd-labs/llamaswap-interface`, this package keeps the same GPL-3.0-or-later
license family and includes attribution in `NOTICE`.
