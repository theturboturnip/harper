import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import SidebarControl from './SidebarControl';
import Logo from './Logo';

import './index.css';
import React, { useRef } from 'react';
import { WorkerLinter } from 'harper.js';
import HarperContext from './HarperContext';

function Sidebar() {
	const linter = useRef(new WorkerLinter());

	return (
		<>
			<HarperContext.Provider value={linter.current}>
				<PluginSidebarMoreMenuItem target="harper-sidebar" icon={Logo}>
					Harper
				</PluginSidebarMoreMenuItem>
				<PluginSidebar name="harper-sidebar" title="Harper" icon={Logo}>
					<SidebarControl />
				</PluginSidebar>
			</HarperContext.Provider>
		</>
	);
}

// @ts-ignore
if (!window.__harperSidebarRegistered) {
	registerPlugin('harper-sidebar', { render: Sidebar });
	// @ts-ignore
	window.__harperSidebarRegistered = true;
}
