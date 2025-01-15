import { dispatch } from '@wordpress/data';

export async function setBlockContent( clientId: string, text: string ) {
	const { selectBlock, updateBlockAttributes } =
		dispatch( 'core/block-editor' );

	let k = await updateBlockAttributes( clientId, { content: text } );
}
