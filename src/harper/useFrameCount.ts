import { useState, useEffect } from 'react';

/** A React hook that counts the number of frames since since a component was first created. Will update every frame. */
export default function useFrameCount(): number {
	let [ count, setFrameCount ] = useState( 0 );

	useEffect( () => {
		let running = true;

		function incRep() {
			setFrameCount( ( v ) => v + 1 );
			requestAnimationFrame( incRep );
		}

		requestAnimationFrame( incRep );

		return () => {
			running = false;
		};
	} );

	return count;
}
