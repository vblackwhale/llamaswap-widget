import type { Address } from 'viem';

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

export function isNativeToken(address: string) {
	return address.toLowerCase() === NATIVE_TOKEN_ADDRESS;
}
