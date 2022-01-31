import { Meteor } from 'meteor/meteor';

import { t, getURL } from '../../utils';
import { WebdavAccounts } from '../../models/client';
import { settings } from '../../settings';
import { MessageAction } from '../../ui-utils';
import { messageArgs } from '../../ui-utils/client/lib/messageArgs';
import { imperativeModal } from '../../../client/lib/imperativeModal';
import SaveToWebdav from '../../../client/views/room/webdav/SaveToWebdavModal';

Meteor.startup(function () {
	MessageAction.addButton({
		id: 'webdav-upload',
		icon: 'upload',
		label: t('Save_To_Webdav'),
		condition: ({ msg: message, subscription }) => {
			if (subscription == null) {
				return false;
			}
			if (WebdavAccounts.findOne() == null) {
				return false;
			}
			if (!message.file) {
				return false;
			}

			return settings.get('Webdav_Integration_Enabled');
		},
		action() {
			const { msg: message } = messageArgs(this);
			const [attachment] = message.attachments;
			const url = getURL(attachment.title_link, { full: true });

			imperativeModal.open({
				component: SaveToWebdav,
				props: {
					data: {
						attachment,
						url,
					},
					onClose: imperativeModal.close,
				},
			});
		},
		order: 100,
		group: 'menu',
	});
});
