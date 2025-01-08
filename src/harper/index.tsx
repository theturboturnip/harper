import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import SidebarControl from './SidebarControl';

function Sidebar() {
	return (
		<>
			<PluginSidebarMoreMenuItem target="harper-sidebar">
				Harper
			</PluginSidebarMoreMenuItem>
			<PluginSidebar name="harper-sidebar" title="Harper">
				<SidebarControl />
			</PluginSidebar>
		</>
	);
}

// @ts-ignore
if ( ! window.__harperSidebarRegistered ) {
	registerPlugin( 'harper-sidebar', { render: Sidebar } );
	// @ts-ignore
	window.__harperSidebarRegistered = true;
}
