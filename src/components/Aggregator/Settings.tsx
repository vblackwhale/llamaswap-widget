import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	Heading,
	HStack,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Switch,
	Tooltip,
	useDisclosure
} from '@chakra-ui/react';
import { chunk } from 'lodash';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const Settings = ({ adapters, disabledAdapters, setDisabledAdapters, onClose: onExternalClose }) => {
	const [isDegenModeEnabled, setIsDegenModeEnabled] = useLocalStorage('llamaswap-degenmode', false);
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
	const onCloseClick = () => {
		onExternalClose();
		onClose();
	};
	const onClick = (name) => (e) => {
		const isChecked = e.target.checked;

		setDisabledAdapters((adaptersState) =>
			isChecked ? adaptersState.filter((adapterName) => adapterName !== name) : adaptersState.concat(name)
		);
	};
	const aggregatorChunks = chunk(adapters, 5);
	return (
		<>
			<Modal isOpen={isOpen} onClose={onCloseClick} size={'lg'}>
				<ModalOverlay />
				<ModalContent color={'white'} justifyContent={'center'} bg="#22242a">
					<ModalHeader pb={2}>Settings</ModalHeader>
					<ModalCloseButton />
					<ModalBody py={2}>
						<HStack mt={0} mb={3}>
							<Heading size={'xs'}>Degen Mode</Heading>{' '}
							<Tooltip label="Disable price impact warnings.">
								<InfoOutlineIcon color="white" border="0" />
							</Tooltip>
							<Switch onChange={() => setIsDegenModeEnabled((mode) => !mode)} isChecked={isDegenModeEnabled} />
						</HStack>
						<Heading size={'xs'}>Enabled Aggregators</Heading>

						<HStack mt={2} alignItems="flex-start">
							{aggregatorChunks.map((aggs) => (
								<List key={aggs.join(',')} spacing={0.5} p={0} m={0} styleType="none">
									{aggs.map((name: string) => (
										<ListItem key={name}>
											<Checkbox mr={2} isChecked={!disabledAdapters.includes(name)} onChange={onClick(name)} />
											{name}
										</ListItem>
									))}
								</List>
							))}
						</HStack>
					</ModalBody>

					<ModalFooter pt={2}>
						<Button colorScheme="blue" mr={3} onClick={onCloseClick}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
