import DataBlock from './DataBlock';
import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import Highlighter from './Highlighter';
import { WorkerLinter } from 'harper.js';

export default function SidebarControl() {
	const documentContainer = useMemo<Element>(
		() => DataBlock.getContainer(),
		[]
	);

	const [blocks, setBlocks] = useState<DataBlock[]>([]);
	const updateBlocks = useCallback(
		() => setBlocks(DataBlock.getAllDataBlocks()),
		[]
	);

	useEffect(updateBlocks, [updateBlocks]);

	useEffect(() => {
		const observer = new MutationObserver(updateBlocks);

		observer.observe(documentContainer, {
			subtree: true,
			childList: true,
		});

		return () => observer.disconnect();
	}, [documentContainer, updateBlocks]);

	const richTexts = useMemo(
		() => blocks.flatMap((block) => block.getAllRichText()),
		[blocks]
	);

	const highlights =
		documentContainer &&
		richTexts.map((richText) =>
			createPortal(
				<Highlighter
					richText={richText}
					key={richText.getTextContent()}
				/>,
				documentContainer
			)
		);

	return <>{highlights}</>;
}
