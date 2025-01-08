import {
	MutableRefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useState,
} from 'react';

/** Get the pixel coordinates in page space, of an element's top left corner. */
export default function useElementPosition(
	ref: MutableRefObject< HTMLElement | null >
): [ number, number ] {
	let [ position, setPosition ] = useState< [ number, number ] >( [ 0, 0 ] );

	let handleUpdate = useCallback( () => {
		if ( ref.current != null ) {
			let rect = ref.current.getBoundingClientRect();

			setPosition( [
				rect.left + window.screenX,
				rect.top + window.screenY,
			] );
		}
	}, [ ref.current ] );

	useEffect( () => {
		handleUpdate();
	}, [] );

	useLayoutEffect( () => {
		handleUpdate();
		window.addEventListener( 'resize', handleUpdate );

		return () => {
			window.removeEventListener( 'resize', handleUpdate );
		};
	}, [ ref.current, handleUpdate ] );

	return position;
}
