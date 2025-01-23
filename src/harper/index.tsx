import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import SidebarControl from './SidebarControl';
import Logo from './Logo';
import './index.css';
import React from 'react';
import { HarperProvider } from './HarperContext';

function Sidebar() {
	return (
		<>
			<PluginSidebarMoreMenuItem target="harper-sidebar" icon={Logo}>
				Harper
			</PluginSidebarMoreMenuItem>
			<PluginSidebar name="harper-sidebar" title="Harper" icon={Logo}>
				<HarperProvider>
					<SidebarControl />
				</HarperProvider>
			</PluginSidebar>
		</>
	);
}

// @ts-ignore
if (!window.__harperSidebarRegistered) {
	registerPlugin('harper-sidebar', { render: Sidebar });
	// @ts-ignore
	window.__harperSidebarRegistered = true;
}
