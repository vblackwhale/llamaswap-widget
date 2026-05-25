import { createContext, useContext } from 'react';

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

const ApiKeysContext = createContext<LlamaSwapApiKeys>({});

export function ApiKeysProvider({ apiKeys, children }: { apiKeys?: LlamaSwapApiKeys; children: React.ReactNode }) {
	return <ApiKeysContext.Provider value={apiKeys ?? {}}>{children}</ApiKeysContext.Provider>;
}

export function useApiKeys() {
	return useContext(ApiKeysContext);
}
