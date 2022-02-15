import { Meteor } from 'meteor/meteor';
import { parser } from '@rocket.chat/message-parser';

import { Messages } from '../../../models/server';
import { IMessage } from '../../../../definition/IMessage/IMessage';
import { settings } from '../../../settings/server';
import { callbacks } from '../../../../lib/callbacks';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { Apps } from '../../../apps/server';
import { parseUrlsInMessage } from './parseUrlsInMessage';

const { DISABLE_MESSAGE_PARSER = 'false' } = process.env;

export const updateMessage = function (message: IMessage, user: Meteor.User, originalMessage: IMessage | undefined): void {
	if (!originalMessage) {
		originalMessage = Messages.findOneById(message._id);
	}

	const appsBridges = Apps.getBridges();
	if (!appsBridges) {
		return;
	}

	// For the Rocket.Chat Apps :)
	if (message && Apps && Apps.isLoaded()) {
		const appMessage = Object.assign({}, originalMessage, message);

		const prevent = Promise.await(appsBridges.getListenerBridge().messageEvent('IPreMessageUpdatedPrevent', appMessage));
		if (prevent) {
			throw new Meteor.Error('error-app-prevented-updating', 'A Rocket.Chat App prevented the message updating.');
		}

		let result;
		result = Promise.await(appsBridges.getListenerBridge().messageEvent('IPreMessageUpdatedExtend', appMessage));
		result = Promise.await(appsBridges.getListenerBridge().messageEvent('IPreMessageUpdatedModify', result));

		if (typeof result === 'object') {
			message = Object.assign(appMessage, result);
		}
	}

	// If we keep history of edits, insert a new message to store history information
	if (settings.get('Message_KeepHistory')) {
		Messages.cloneAndSaveAsHistoryById(message._id, user);
	}

	message.editedAt = new Date();
	message.editedBy = {
		_id: user._id,
		username: user.username || '',
	};

	parseUrlsInMessage(message);

	message = callbacks.run('beforeSaveMessage', message);

	try {
		if (message.msg && DISABLE_MESSAGE_PARSER !== 'true') {
			message.md = parser(message.msg);
		}
	} catch (e: any) {
		SystemLogger.error(e); // errors logged while the parser is at experimental stage
	}

	const tempid = message._id;

	Messages.update({ _id: tempid }, { $set: message });

	if (Apps?.isLoaded()) {
		// This returns a promise, but it won't mutate anything about the message
		// so, we don't really care if it is successful or fails
		appsBridges.getListenerBridge().messageEvent('IPostMessageUpdated', message);
	}
};
