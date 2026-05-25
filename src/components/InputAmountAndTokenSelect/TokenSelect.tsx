import { ethers } from 'ethers';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { Button, Flex, Input, Text, Tooltip } from '@chakra-ui/react';
import styled from 'styled-components';
import { ChevronDown, Database, Search, Star, X } from 'react-feather';
import { IconImage } from '../Aggregator/Search';
import { useDebounce } from '../../hooks/useDebounce';
import { quickSuggestionSymbolsByChainId } from '../../widget/tokenList';
import { NATIVE_TOKEN_ADDRESS } from '../../widget/tokens';

const blockExplorersByChain = {
	1: { name: 'Etherscan', url: 'https://etherscan.io' },
	10: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
	56: { name: 'BscScan', url: 'https://bscscan.com' },
	137: { name: 'Polygonscan', url: 'https://polygonscan.com' },
	8453: { name: 'Basescan', url: 'https://basescan.org' },
	42161: { name: 'Arbiscan', url: 'https://arbiscan.io' },
	43114: { name: 'SnowTrace', url: 'https://snowtrace.io' }
};

const Overlay = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1500;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.6);
`;

const Dialog = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: min(540px, calc(100vw - 32px));
	height: min(620px, calc(100vh - 48px));
	padding: 16px;
	border: 1px solid #2f333c;
	border-radius: 16px;
	background: #101011;
	color: ${({ theme }) => theme.text1};
	box-shadow: none;
	animation: scale-in-center 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

	@keyframes scale-in-center {
		0% {
			transform: scale(0.96);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	display: grid;
	place-items: center;
	width: 32px;
	height: 32px;
	border: 0;
	border-radius: 8px;
	background: transparent;
	color: inherit;
	cursor: pointer;

	&:hover {
		background: rgba(246, 246, 246, 0.1);
	}
`;

const SearchWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 12px;
	min-height: 52px;
	padding: 0 14px;
	border: 1px solid rgba(250, 250, 250, 0.88);
	border-radius: 12px;
	background: #19191a;
	color: #fafafa;
`;

const Suggestions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 16px;
`;

const SuggestionButton = styled.button`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	width: 72px;
	height: 72px;
	padding: 8px;
	border: 0;
	border-radius: 8px;
	background: #181819;
	color: ${({ theme }) => theme.text1};
	font-size: 0.9375rem;
	cursor: pointer;

	&:hover {
		background: #2d3037;
	}
`;

const ListTitle = styled.h2`
	display: flex;
	align-items: center;
	gap: 8px;
	&& {
		margin: 22px 0 14px;
	}
	color: #a2a2a2;
	font-size: 0.9375rem;
	font-weight: 500;
`;

const List = styled.div`
	flex: 1;
	min-height: 0;
	overflow: auto;
	padding-bottom: 12px;

	&::-webkit-scrollbar {
		width: 12px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: #77777d;
		border: 4px solid #101011;
		border-radius: 999px;
	}
`;

const TokenRow = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
	min-height: 56px;
	padding: 6px 4px;
	cursor: pointer;

	&[data-defaultcursor='true'] {
		cursor: default;
	}

	&:hover {
		background: rgba(246, 246, 246, 0.1);
	}
`;

const ExplorerLink = styled.a`
	color: ${({ theme }) => theme.text3};
	font-size: 0.875rem;
	text-decoration: none;
`;

const saveToken = (token) => {
	const tokens = JSON.parse(localStorage.getItem('savedTokens') || '{}');
	const chainTokens = tokens[token.chainId] || [];
	const newTokens = { ...tokens, [token.chainId]: chainTokens.concat(token) };
	localStorage.setItem('savedTokens', JSON.stringify(newTokens));
};

const AddToken = ({ address, selectedChain, onClick }) => {
	const onTokenClick = () => {
		const token = {
			address,
			name: address.slice(0, 4) + '...' + address.slice(-4),
			symbol: address.slice(0, 4) + '...' + address.slice(-4),
			decimals: 18,
			label: address.slice(0, 4) + '...' + address.slice(-4),
			value: address,
			chainId: selectedChain?.id,
			logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`
		};

		saveToken(token);
		onClick(token);
	};

	return (
		<TokenRow onClick={onTokenClick}>
			<IconImage
				src={`https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`}
				onError={(e) => (e.currentTarget.src = '/placeholder.png')}
			/>
			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{address.slice(0, 4) + '...' + address.slice(-4)}
			</Text>
			<Button height={32} marginLeft="auto" onClick={onTokenClick}>
				Add token
			</Button>
		</TokenRow>
	);
};

const Row = ({ chain, token, onClick }) => {
	const blockExplorer = blockExplorersByChain[chain?.id];
	const isMultichain = token.isMultichain;

	return (
		<TokenRow data-defaultcursor={token.isGeckoToken ? true : false} onClick={() => !token.isGeckoToken && onClick(token)}>
			<IconImage
				src={token.logoURI}
				onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
				style={{ width: 32, height: 32 }}
			/>

			<Flex flexDir="column" minW={0}>
				<Tooltip
					label="This token could have been affected by the multichain hack."
					bg="black"
					color="white"
					isDisabled={!isMultichain}
				>
					<Text
						as="span"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
						overflow="hidden"
						color={isMultichain ? 'orange.200' : 'white'}
						fontSize="0.875rem"
						lineHeight={1.2}
					>
						{token.name || token.symbol}
						{token.isMultichain ? <WarningTwoIcon color={'orange.200'} style={{ marginLeft: '0.4em' }} /> : null}
					</Text>
				</Tooltip>

				<Flex gap="6px" alignItems="center" color="#8f8f92" minW={0}>
					<Text as="span" fontSize="0.75rem" color="#a2a2a2" lineHeight={1.2}>
						{token.symbol}
					</Text>
					{blockExplorer ? (
						<ExplorerLink href={`${blockExplorer.url}/address/${token.address}`} target="_blank" rel="noreferrer noopener">
							{token.address.slice(0, 5)}...{token.address.slice(-5)}
						</ExplorerLink>
					) : null}
				</Flex>
			</Flex>

			{token.balanceUSD ? (
				<div style={{ marginRight: 0, marginLeft: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>
					<div style={{ color: '#fafafa', fontSize: '0.875rem', lineHeight: 1.2 }}>${token.balanceUSD?.toFixed(3)}</div>
					<div style={{ color: '#a2a2a2', fontSize: '0.875rem', lineHeight: 1.2 }}>
						{(token.amount / 10 ** token.decimals).toFixed(3)}
					</div>
				</div>
			) : null}

			{token.isGeckoToken ? (
				<Tooltip
					label="This token doesn't appear on active token list(s). Make sure this is the token that you want to trade."
					bg="black"
					color="white"
				>
					<Button
						fontSize={'0.875rem'}
						fontWeight={500}
						ml="auto"
						colorScheme={'orange'}
						onClick={(event) => {
							event.stopPropagation();
							onClick(token);
						}}
						leftIcon={<WarningTwoIcon />}
						flexShrink={0}
					>
						<span style={{ position: 'relative', top: '1px' }}>Import Token</span>
					</Button>
				</Tooltip>
			) : null}
		</TokenRow>
	);
};

const SelectModal = ({ onClose, data, onClick, selectedChain }) => {
	const [input, setInput] = useState('');
	const debouncedInput = useDebounce(input, 300);
	const list = data ?? [];

	const suggestions = useMemo(() => {
		const configuredSymbols = quickSuggestionSymbolsByChainId[selectedChain?.id] ?? [];
		const resolved = configuredSymbols
			.map((symbol) => findSuggestionToken(list, symbol))
			.filter(Boolean);

		return dedupeSuggestionTokens([...resolved, ...list]).slice(0, 5);
	}, [list, selectedChain?.id]);

	const filteredData = useMemo(() => {
		return debouncedInput
			? list.filter((token) => {
					if (token.symbol && token.symbol.toLowerCase()?.includes(debouncedInput.toLowerCase())) return true;
					if (token.address && token.address.toLowerCase() === debouncedInput.toLowerCase()) return true;
					if (token.name && token.name.toLowerCase()?.includes(debouncedInput.toLowerCase())) return true;
					return false;
			  })
			: list;
	}, [debouncedInput, list]);
	const ownedTokens = useMemo(
		() => (!debouncedInput ? filteredData.filter((token) => token.balanceUSD || token.amount) : []),
		[debouncedInput, filteredData]
	);
	const volumeTokens = useMemo(
		() =>
			!debouncedInput && ownedTokens.length
				? filteredData.filter((token) => !ownedTokens.some((ownedToken) => ownedToken.address === token.address))
				: filteredData,
		[debouncedInput, filteredData, ownedTokens]
	);

	const parentRef = useRef<HTMLDivElement>();
	const rowVirtualizer = useVirtualizer({
		count: volumeTokens.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56,
		overscan: 10
	});

	return (
		<Overlay onMouseDown={onClose}>
			<Dialog
				role="dialog"
				aria-modal="true"
				aria-labelledby="llamaswap-token-select-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<Text as="h1" id="llamaswap-token-select-title" textAlign="center" fontWeight={500} color="#FAFAFA" fontSize={20} lineHeight={1.2}>
					Select a token
				</Text>
				<CloseButton type="button" onClick={onClose} aria-label="Close token selector">
					<X size={20} />
				</CloseButton>

				<SearchWrapper>
					<Search size={17} />
					<Input
						bg="transparent"
						border="none"
						color="#fafafa"
						fontSize="1rem"
						_placeholder={{ color: '#a2a2a2' }}
						placeholder="Search... (Symbol or Address)"
						_focusVisible={{ outline: 'none' }}
						onChange={(event) => setInput(event?.target?.value)}
						autoFocus
					/>
				</SearchWrapper>

				{!debouncedInput ? (
					<Suggestions>
						{suggestions.map((token) => (
							<SuggestionButton key={`${token.chainId}:${token.address}`} type="button" onClick={() => onClick(token)}>
								<IconImage
									src={token.logoURI}
									onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
									style={{ width: 24, height: 24 }}
								/>
								<span>{token.symbol}</span>
							</SuggestionButton>
						))}
					</Suggestions>
				) : null}

				{ethers.utils.isAddress(input) && filteredData.length === 0 ? (
					<AddToken address={input} onClick={onClick} selectedChain={selectedChain} />
				) : null}

				{ownedTokens.length ? (
					<>
						<ListTitle>
							<Database size={16} fill="currentColor" />
							<span>Your tokens</span>
						</ListTitle>
						{ownedTokens.map((token) => (
							<Row key={`owned:${token.chainId}:${token.address}`} token={token} onClick={onClick} chain={selectedChain} />
						))}
					</>
				) : null}

				{!debouncedInput ? (
					<ListTitle>
						<Star size={16} fill="currentColor" />
						<span>Tokens by 24H volume</span>
					</ListTitle>
				) : null}

				<List ref={parentRef}>
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative'
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const token = volumeTokens[virtualRow.index];
							return (
								<div
									key={`${virtualRow.index}:${token.address}`}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`
									}}
								>
									<Row token={token} onClick={onClick} chain={selectedChain} />
								</div>
							);
						})}
					</div>
				</List>
			</Dialog>
		</Overlay>
	);
};

function findSuggestionToken(tokens, symbol: string) {
	const normalizedSymbol = normalizeSymbol(symbol);
	const matches = tokens.filter((token) => normalizeSymbol(token.symbol) === normalizedSymbol);
	const nativeMatch = matches.find((token) => token.address?.toLowerCase() === NATIVE_TOKEN_ADDRESS);
	if (nativeMatch) return nativeMatch;
	return matches.sort((a, b) => ((b as any).volume24h ?? 0) - ((a as any).volume24h ?? 0))[0];
}

function dedupeSuggestionTokens(tokens) {
	const seen = new Set<string>();
	return tokens.filter((token) => {
		const key = token?.address?.toLowerCase();
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function normalizeSymbol(symbol?: string) {
	return (symbol ?? '').replace(/₮/g, 'T').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export const TokenSelect = ({ tokens, onClick, token, selectedChain }) => {
	const [isOpen, setIsOpen] = useState(false);

	const onTokenClick = (token) => {
		onClick(token);
		setIsOpen(false);
	};

	return (
		<>
			<Button
				display="flex"
				gap="6px"
				flexWrap="nowrap"
				alignItems="center"
				w="100%"
				borderRadius="8px"
				bg="#222429"
				border="0"
				_hover={{ bg: '#2d3037' }}
				maxW={{ base: '128px', md: '9rem' }}
				p="12px"
				cursor="pointer"
				onClick={() => setIsOpen(true)}
			>
				{token ? <IconImage src={token.logoURI} onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')} /> : null}

				<Tooltip
					label="This token could have been affected by the multichain hack."
					bg="black"
					color="white"
					isDisabled={!token?.isMultichain}
				>
					<span>{token?.isMultichain ? <WarningTwoIcon color={'orange.200'} /> : null}</span>
				</Tooltip>

				<Text as="span" color="white" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" fontWeight={400}>
					{token ? token.symbol : 'Select Token'}
				</Text>

				<ChevronDown size={16} style={{ marginLeft: 'auto' }} />
			</Button>
			{isOpen ? (
				<SelectModal
					onClose={() => setIsOpen(false)}
					data={tokens}
					onClick={onTokenClick}
					selectedChain={selectedChain}
				/>
			) : null}
		</>
	);
};
