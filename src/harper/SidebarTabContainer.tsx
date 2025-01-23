import React from 'react';
import LintSettingList from './LintSettingList';
import { TabPanel } from '@wordpress/components';
import LintList from './LintList';
import { LintBox } from './Box';

export default function SidebarTabContainer({
	lintBoxes,
}: {
	lintBoxes: LintBox[];
}) {
	return (
		<TabPanel
			tabs={[
				{ name: 'errors', title: 'Errors' },
				{ name: 'settings', title: 'Settings' },
			]}
		>
			{(tab) => {
				switch (tab.name) {
					case 'errors':
						return <LintList lintBoxes={lintBoxes} />;
					case 'settings':
						return <LintSettingList />;
				}
			}}
		</TabPanel>
	);
}
