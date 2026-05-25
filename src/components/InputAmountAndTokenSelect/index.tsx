import { Flex, Input, Text, Button, Box } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import styled from 'styled-components';
import type { IToken } from '../../types';
import { formattedNum } from '../../utils';
import { formatAmount } from '../../utils/formatAmount';
import { PRICE_IMPACT_HIGH_THRESHOLD, PRICE_IMPACT_MEDIUM_THRESHOLD } from '../Aggregator/constants';
import { TokenSelect } from './TokenSelect';

export function InputAmountAndTokenSelect({
	amount,
	setAmount,
	type,
	tokens,
	token,
	onSelectTokenChange,
	selectedChain,
	balance,
	onMaxClick,
	tokenPrice,
	priceImpact,
	placeholder,
	customSelect,
	disabled = false
}: {
	amount: string | number;
	setAmount: Dispatch<SetStateAction<[string | number, string | number]>>;
	type: 'amountIn' | 'amountOut';
	tokens: Array<IToken>;
	token: IToken;
	onSelectTokenChange: (token: any) => void;
	selectedChain: {
		id: any;
		value: string;
		label: any;
		chainId: any;
		logoURI: string;
	};
	balance?: string;
	onMaxClick?: () => void;
	tokenPrice?: number;
	priceImpact?: number;
	placeholder?: string | number;
	customSelect?: React.ReactElement;
	disabled?: boolean;
}) {
	const amountUsd =
		amount && tokenPrice && !Number.isNaN(Number(formatAmount(amount))) && !Number.isNaN(Number(tokenPrice))
			? BigNumber(formatAmount(amount)).times(tokenPrice).toFixed(2)
			: null;
	const balanceAmount = balance && !Number.isNaN(Number(balance)) ? BigNumber(balance) : null;
	const amountPercent =
		type === 'amountIn' && balanceAmount?.gt(0) && amount !== '' && !Number.isNaN(Number(formatAmount(amount)))
			? BigNumber(formatAmount(amount)).div(balanceAmount).times(100).decimalPlaces(0).toNumber()
			: 0;
	const sliderPercent = Math.min(100, Math.max(0, amountPercent || 0));

	const setAmountPercent = (percent: number) => {
		if (!balanceAmount) return;
		if (percent === 100 && onMaxClick) {
			onMaxClick();
			return;
		}
		setAmount([percent === 0 ? '' : formatSliderAmount(balanceAmount.times(percent).div(100)), '']);
	};

	return (
		<Flex
			flexDir="column"
			gap="8px"
			bg="#141619"
			color="white"
			borderRadius="12px"
			p={['8px', '8px', '16px', '16px']}
			border="1px solid transparent"
			_focusWithin={{ border: '1px solid white' }}
		>
			<Text fontSize="0.875rem" fontWeight={400} color="#a2a2a2" whiteSpace="nowrap" minH="1.375rem">
				{type === 'amountIn' ? 'You sell' : 'You buy'}
			</Text>

			<Flex flexDir={{ md: 'row' }} gap={{ base: '12px', md: '8px' }}>
				<Box pos="relative">
					<Input
						disabled={disabled}
						type="text"
						value={amount}
						focusBorderColor="transparent"
						border="none"
						bg="#141619"
						color="white"
						_focusVisible={{ outline: 'none' }}
						fontSize="2.25rem"
						p="0"
						placeholder={(placeholder && String(placeholder)) || '0'}
						_placeholder={{ color: '#5c5c5c' }}
						onChange={(e) => {
							const value = formatNumber(e.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));

							if (type === 'amountOut') {
								setAmount(['', value]);
							} else {
								setAmount([value, '']);
							}
						}}
						overflow="hidden"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
					/>
				</Box>

				{customSelect ? (
					customSelect
				) : (
					<TokenSelect tokens={tokens} token={token} onClick={onSelectTokenChange} selectedChain={selectedChain} />
				)}
			</Flex>

			<Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="8px" minH="1.375rem">
				<Text
					fontSize="0.875rem"
					fontWeight={300}
					color="#a2a2a2"
					overflow="hidden"
					whiteSpace="nowrap"
					textOverflow="ellipsis"
				>
					{amountUsd && (
						<>
							<span>{`~$${formattedNum(amountUsd)}`}</span>
							<Text
								as="span"
								color={
									priceImpact >= PRICE_IMPACT_HIGH_THRESHOLD
										? 'red.500'
										: priceImpact >= PRICE_IMPACT_MEDIUM_THRESHOLD
											? 'yellow.500'
											: '#a2a2a2'
								}
							>
								{priceImpact && !Number.isNaN(priceImpact)
									? priceImpact < 0
										? ` (+${(priceImpact * -1).toFixed(2)}%)`
										: ` (-${priceImpact.toFixed(2)}%)`
									: ''}
							</Text>
						</>
					)}
				</Text>

				<Flex alignItems="center" justifyContent="flex-start" flexWrap="nowrap" gap="8px">
					{balance && (
						<>
							<Text fontSize="0.875rem" fontWeight={300} color="#a2a2a2">{`Balance: ${Number(balance).toFixed(
								4
							)}`}</Text>

							{onMaxClick && (
								<Button
									onClick={onMaxClick}
									p="0"
									minH={0}
									minW={0}
									h="fit-content"
									bg="none"
									_hover={{ bg: 'none' }}
									fontSize="0.875rem"
									fontWeight={500}
									color="#1f72e5"
									border="none"
									cursor="pointer"
								>
									Max
								</Button>
							)}
						</>
					)}
				</Flex>
			</Flex>

			{type === 'amountIn' ? (
				<AmountPercentSlider percent={sliderPercent} onChange={setAmountPercent} disabled={!balanceAmount?.gt(0)} />
			) : null}
		</Flex>
	);
}

function AmountPercentSlider({
	percent,
	onChange,
	disabled
}: {
	percent: number;
	onChange: (percent: number) => void;
	disabled?: boolean;
}) {
	const stops = [0, 25, 50, 75, 100];

	return (
		<Box pos="relative" h="28px" mt="2px" style={{ '--range-value': `${percent}%` } as React.CSSProperties}>
			<Text
				as="span"
				pos="absolute"
				top="-10px"
				left={`calc(${percent}% - 10px)`}
				minW="32px"
				px="6px"
				py="2px"
				textAlign="center"
				fontSize="0.75rem"
				fontWeight={600}
				color="#fafafa"
				bg="#2d3037"
				borderRadius="6px"
				pointerEvents="none"
				zIndex={2}
			>
				{percent}%
			</Text>
			<RangeInput
				type="range"
				min="0"
				max="100"
				value={percent}
				disabled={disabled}
				onChange={(event) => onChange(Number(event.target.value))}
				$percent={percent}
			/>
			{stops.map((stop) => (
				<button
					type="button"
					key={stop}
					aria-label={`Set amount to ${stop}%`}
					disabled={disabled}
					onClick={() => onChange(stop)}
					style={{
						position: 'absolute',
						left: `calc(${stop}% - 4px)`,
						bottom: '3px',
						width: '8px',
						height: '8px',
						padding: 0,
						border: 0,
						borderRadius: '999px',
						background: '#4a4d55',
						cursor: disabled ? 'not-allowed' : 'pointer',
						opacity: disabled ? 0.55 : 1
					}}
				/>
			))}
		</Box>
	);
}

const RangeInput = styled.input<{ $percent: number }>`
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	height: 14px;
	margin: 0;
	background: transparent;
	cursor: pointer;
	appearance: none;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	&::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 999px;
		background: ${({ $percent }) => `linear-gradient(to right, #1f72e5 0%, #1f72e5 ${$percent}%, #4a4d55 ${$percent}%, #4a4d55 100%)`};
	}

	&::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		margin-top: -8px;
		border: 0;
		border-radius: 999px;
		background: #1f72e5;
	}

	&::-moz-range-track {
		height: 4px;
		border-radius: 999px;
		background: #4a4d55;
	}

	&::-moz-range-progress {
		height: 4px;
		border-radius: 999px;
		background: #1f72e5;
	}

	&::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border: 0;
		border-radius: 999px;
		background: #1f72e5;
	}
`;

function formatSliderAmount(value: BigNumber) {
	return value.decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed();
}

function formatNumber(string) {
	let pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b)/g;
	if (string.includes('.')) {
		pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b\.)/g;
	}
	return string.replace(pattern, ' ');
}
