import type { ReactNode } from 'react';
import styled from 'styled-components';

const Provider = styled.div`
	width: 100%;
	& > div {
		width: 100%;
	}
`;

export const WalletWrapper = ({ children }: { children: ReactNode }) => {
	return <Provider>{children}</Provider>;
};
