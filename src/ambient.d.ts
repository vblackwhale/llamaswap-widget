declare const process: {
	env: Record<string, string | undefined>;
};

declare module '*.png' {
	const src: string;
	export default src;
}

declare module '@defillama/sdk/build/abi' {
	export const multiCall: (params: any) => Promise<any>;
}

declare module '@gnosis.pm/gp-v2-contracts' {
	export const domain: any;
	export const SigningScheme: any;
	export const signOrder: any;
	export const OrderKind: any;
}

declare module '@gnosis.pm/gp-v2-contracts/deployments/mainnet/GPv2Settlement.json' {
	const artifact: { abi: any };
	export default artifact;
}

declare module 'echarts/core' {
	export const use: (extensions: any[]) => void;
	export const getInstanceByDom: (dom: HTMLElement | null) => any;
	export const init: (dom: HTMLElement | null) => any;
}

declare module 'echarts/renderers' {
	export const SVGRenderer: any;
}

declare module 'echarts/charts' {
	export const LineChart: any;
}

declare module 'echarts/components' {
	export const DataZoomComponent: any;
	export const GraphicComponent: any;
	export const GridComponent: any;
	export const TooltipComponent: any;
}
