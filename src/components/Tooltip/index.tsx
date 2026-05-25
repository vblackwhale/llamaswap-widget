import * as React from 'react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';

interface ITooltip {
	content: string | null | React.ReactNode;
	href?: string;
	onClick?: (e: any) => any;
	style?: {};
	children: React.ReactNode;
	as?: any;
}

export default function Tooltip({ content, href, onClick, children, ...props }: ITooltip) {
	if (!content || content === '') return <span>{children}</span>;

	const body = href ? (
		<a href={href} onClick={onClick}>
			{children}
		</a>
	) : (
		<span onClick={onClick}>{children}</span>
	);

	return (
		<ChakraTooltip label={content} {...props}>
			{body}
		</ChakraTooltip>
	);
}

export function Tooltip2(props: ITooltip) {
	return <Tooltip {...props} />;
}
