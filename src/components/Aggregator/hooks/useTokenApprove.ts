import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { nativeAddress } from '../constants';
import { providers } from '../rpcs';
import { useQuery } from '@tanstack/react-query';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
	'0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'.toLowerCase() // LDO
];

async function getAllowance({
	token,
	chain,
	address,
	spender
}: {
	token?: string;
	chain: string;
	address?: `0x${string}`;
	spender?: `0x${string}`;
}) {
	if (!spender || !token || !address || token === ethers.constants.AddressZero) {
		return null;
	}
	try {
		const provider = providers[chain];
		const tokenContract = new ethers.Contract(token, erc20Abi, provider);
		const allowance = await tokenContract.allowance(address, spender);
		return allowance;
	} catch (error) {
		throw new Error(error instanceof Error ? `[Allowance]:${error.message}` : '[Allowance]: Failed to fetch allowance');
	}
}

const useGetAllowance = ({
	token,
	spender,
	amount,
	chain
}: {
	token?: `0x${string}`;
	spender?: `0x${string}`;
	amount?: string;
	chain: string;
}) => {
	const { address } = useAccount();

	const isOld = token ? oldErc.includes(token?.toLowerCase()) : false;

	const {
		data: allowance,
		refetch,
		isLoading,
		error: errorFetchingAllowance
	} = useQuery({
		queryKey: ['token-allowance', address, token, chain, spender],
		queryFn: () =>
			getAllowance({
				token,
				chain,
				address,
				spender
			}),
		retry: 2
	});

	const shouldRemoveApproval =
		isOld &&
		allowance &&
		amount &&
		!Number.isNaN(Number(amount)) &&
		allowance.lt(BigNumber.from(amount)) &&
		!allowance.eq(0);

	return { allowance, shouldRemoveApproval, refetch, isLoading, errorFetchingAllowance };
};

export const useTokenApprove = ({
	token,
	spender,
	amount,
	chain
}: {
	token?: `0x${string}`;
	spender?: `0x${string}`;
	amount?: string;
	chain: string;
}) => {
	const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
	const [isConfirmingInfiniteApproval, setIsConfirmingInfiniteApproval] = useState(false);
	const [isConfirmingResetApproval, setIsConfirmingResetApproval] = useState(false);
	const publicClient = usePublicClient();
	const chainId = useChainId();
	const { writeContractAsync, isPending } = useWriteContract();

	const { address, isConnected } = useAccount();

	const {
		allowance,
		shouldRemoveApproval,
		refetch,
		isLoading: isFetchingAllowance,
		errorFetchingAllowance
	} = useGetAllowance({
		token,
		spender,
		amount,
		chain
	});

	const normalizedAmount = !Number.isNaN(Number(amount)) ? amount : '0';

	const approveAmount = async (approvalAmount: bigint, setConfirming: (next: boolean) => void) => {
		if (!isConnected || !spender || !token || !publicClient) return;
		const hash = await writeContractAsync({
			address: token,
			abi: erc20Abi,
			functionName: 'approve',
			args: [spender, approvalAmount],
			chainId,
			account: address
		} as any);

		setConfirming(true);
		try {
			await publicClient.waitForTransactionReceipt({ hash });
			refetch();
		} finally {
			setConfirming(false);
		}
	};

	const approve = () => approveAmount(BigInt(normalizedAmount || '0'), setIsConfirmingApproval);
	const approveInfinite = () => approveAmount(BigInt(ethers.constants.MaxUint256.toString()), setIsConfirmingInfiniteApproval);
	const approveReset = () => approveAmount(0n, setIsConfirmingResetApproval);

	if (token === ethers.constants.AddressZero || token?.toLowerCase() === nativeAddress.toLowerCase())
		return { isApproved: true };

	if (!address || !allowance) return { isApproved: false, errorFetchingAllowance };

	if (allowance.toString() === ethers.constants.MaxUint256.toString()) return { isApproved: true, allowance };

	if (normalizedAmount && allowance.gte(BigNumber.from(normalizedAmount))) return { isApproved: true, allowance };

	return {
		isApproved: false,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isFetchingAllowance || isPending || isConfirmingApproval,
		isConfirmingApproval,
		isInfiniteLoading: isPending || isConfirmingInfiniteApproval,
		isConfirmingInfiniteApproval,
		isResetLoading: isPending || isConfirmingResetApproval,
		isConfirmingResetApproval,
		allowance,
		shouldRemoveApproval,
		refetch
	};
};
