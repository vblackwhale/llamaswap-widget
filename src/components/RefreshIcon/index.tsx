import { useCountdown } from '../../hooks/useCountdown';
import { REFETCH_INTERVAL } from '../../queries/useGetRoutes';
import { RepeatIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import { Tooltip2 } from '../Tooltip';

export const RefreshIcon = ({ refetch, lastFetched }: { refetch: () => void; lastFetched: number }) => {
	const secondsToRefresh = useCountdown(lastFetched + REFETCH_INTERVAL);
	const progress = Math.max(0, Math.min(100, 100 - (secondsToRefresh / (REFETCH_INTERVAL / 1000)) * 100));
	const circumference = 2 * Math.PI * 10;
	const strokeOffset = circumference - (progress / 100) * circumference;

	return (
		<Tooltip2
			content={`Displayed data will auto-refresh after ${secondsToRefresh} seconds. Click here to update manually`}
		>
			<Box
				as="button"
				type="button"
				onClick={refetch}
				position="relative"
				width="24px"
				height="24px"
				padding="0"
				border="0"
				borderRadius="50%"
				background="transparent"
				color="#fafafa"
				cursor="pointer"
				lineHeight="0"
				_hover={{ background: 'transparent' }}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					style={{ display: 'block', position: 'absolute', inset: 0, pointerEvents: 'none' }}
					aria-hidden="true"
					focusable="false"
				>
					<circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2.5" />
					<circle
						cx="12"
						cy="12"
						r="10"
						fill="none"
						stroke="#4299e1"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeOffset}
						transform="rotate(-90 12 12)"
					/>
				</svg>
				<Box
					position="absolute"
					inset="0"
					display="flex"
					alignItems="center"
					justifyContent="center"
					pointerEvents="none"
				>
					<RepeatIcon display="block" boxSize="15px" />
				</Box>
			</Box>
		</Tooltip2>
	);
};
