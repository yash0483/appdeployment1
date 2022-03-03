import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { CachedChatSubscription } from '../../../app/models/client';
import { Notifications } from '../../../app/notifications/client';
import { readMessage } from '../../../app/ui-utils/client';
import { KonchatNotification } from '../../../app/ui/client';
import { getUserPreference } from '../../../app/utils/client';
import { IMessage } from '../../../definition/IMessage';
import { IRoom } from '../../../definition/IRoom';
import { ISubscription } from '../../../definition/ISubscription';
import { fireGlobalEvent } from '../../lib/utils/fireGlobalEvent';
import { isLayoutEmbedded } from '../../lib/utils/isLayoutEmbedded';

const notifyNewRoom = (sub: ISubscription): void => {
	if (Session.equals(`user_${Meteor.userId()}_status`, 'busy')) {
		return;
	}

	if ((!FlowRouter.getParam('name') || FlowRouter.getParam('name') !== sub.name) && !sub.ls && sub.alert === true) {
		KonchatNotification.newRoom(sub.rid);
	}
};

type NotificationEvent = {
	title: string;
	text: string;
	duration: number;
	payload: {
		_id: IMessage['_id'];
		rid: IMessage['rid'];
		tmid: IMessage['_id'];
		sender: IMessage['u'];
		type: IRoom['t'];
		name: IRoom['name'];
		message: {
			msg: IMessage['msg'];
			t: string;
		};
	};
};

Meteor.startup(() => {
	Tracker.autorun(() => {
		if (!Meteor.userId()) {
			return;
		}

		Notifications.onUser('notification', (notification: NotificationEvent) => {
			// This logic is duplicated in /client/startup/unread.coffee.
			const hasFocus = readMessage.isEnabled();
			const muteFocusedConversations = getUserPreference(Meteor.userId(), 'muteFocusedConversations');
			const { rid } = notification.payload;
			const messageIsInOpenedRoom = Session.get('openedRoom') === notification.payload.rid;

			fireGlobalEvent('notification', {
				notification,
				fromOpenedRoom: messageIsInOpenedRoom,
				hasFocus,
			});

			/*
			 * If the user is using the embedded layout, we don't have sidebar neither the concept of more rooms,
			 * so if somehow the user receives a notification in a room that is not open, we don't show the notification.
			 */
			if (isLayoutEmbedded()) {
				if (messageIsInOpenedRoom && hasFocus) {
					KonchatNotification.showDesktop(notification);
					KonchatNotification.newMessage(rid);
				}
				return;
			}

			/*
			 * In the other hand, if the user is using the normal layout, we have the sidebar and multiple rooms,
			 * then want to show the notification only if the notification is not from the current one
			 */

			(!hasFocus || !messageIsInOpenedRoom) && KonchatNotification.showDesktop(notification);

			/*
			 * Even so, the user has a setting to make 'plim' even if the notification is from the current room
			 */
			hasFocus && messageIsInOpenedRoom && !muteFocusedConversations && KonchatNotification.newMessage(rid);
		});

		CachedChatSubscription.onSyncData = ((action: 'changed' | 'removed', sub: ISubscription): void => {
			if (action !== 'removed') {
				notifyNewRoom(sub);
			}
		}) as () => void;

		Notifications.onUser('subscriptions-changed', (_action: 'changed' | 'removed', sub: ISubscription) => {
			notifyNewRoom(sub);
		});
	});
});
