import { erc20Abi, maxUint256, type Address, type PublicClient, type WalletClient } from 'viem';

export async function getAllowance({
	publicClient,
	token,
	owner,
	spender
}: {
	publicClient: PublicClient;
	token: Address;
	owner: Address;
	spender: Address;
}) {
	return publicClient.readContract({
		abi: erc20Abi,
		address: token,
		functionName: 'allowance',
		args: [owner, spender]
	} as any);
}

export async function approveToken({
	publicClient,
	walletClient,
	token,
	spender,
	amount
}: {
	publicClient: PublicClient;
	walletClient: WalletClient;
	token: Address;
	spender: Address;
	amount: bigint;
}) {
	const [account] = await walletClient.getAddresses();
	const hash = await walletClient.writeContract({
		account,
		chain: walletClient.chain,
		abi: erc20Abi,
		address: token,
		functionName: 'approve',
		args: [spender, amount || maxUint256]
	});

	await publicClient.waitForTransactionReceipt({ hash });
	return hash;
}
