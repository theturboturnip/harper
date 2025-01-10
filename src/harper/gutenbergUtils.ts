import { dispatch } from '@wordpress/data';

export function setBlockContent( clientId: string, text: string ) {
	const { selectBlock, updateBlockAttributes } =
		dispatch( 'core/block-editor' );

	selectBlock( clientId );
	updateBlockAttributes( clientId, { content: text } );
}
