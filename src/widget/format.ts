import { formatUnits, parseUnits } from 'viem';

export function parseTokenAmount(value: string, decimals: number) {
	const normalized = value.trim().replace(/,/g, '.').replace(/\s/g, '');
	if (!normalized) return 0n;
	return parseUnits(normalized, decimals);
}

export function formatTokenAmount(value: bigint, decimals: number, maxFractionDigits = 6) {
	const formatted = formatUnits(value, decimals);
	const [integer, fraction = ''] = formatted.split('.');
	const trimmedFraction = fraction.slice(0, maxFractionDigits).replace(/0+$/, '');
	return trimmedFraction ? `${integer}.${trimmedFraction}` : integer;
}

export function formatGas(value?: bigint) {
	if (!value) return 'Unknown gas';
	return `${value.toString()} gas`;
}
