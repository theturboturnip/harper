import DataBlock from './DataBlock';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Highlighter from './Highlighter';
import React from 'react';

export default function SidebarControl() {
	let documentContainer = useMemo< Element >(
		() => DataBlock.getContainer(),
		[]
	);

	const [ blocks, setBlocks ] = useState< DataBlock[] >( [] );
	const updateBlocks = useCallback(
		() => setBlocks( DataBlock.getAllDataBlocks() ),
		[]
	);

	useEffect( updateBlocks, [] );

	useEffect( () => {
		let observer = new MutationObserver( updateBlocks );

		observer.observe( documentContainer, {
			subtree: true,
			childList: true,
		} );

		return () => observer.disconnect();
	}, [ documentContainer, updateBlocks ] );

	const richTexts = useMemo(
		() => blocks.flatMap( ( block ) => block.getAllRichText() ),
		[ blocks ]
	);

	let highlights =
		documentContainer &&
		richTexts.map( ( richText ) =>
			createPortal(
				<Highlighter
					richText={ richText }
					key={ richText.getTextContent() }
				/>,
				documentContainer
			)
		);

	return <>{ highlights }</>;
}
