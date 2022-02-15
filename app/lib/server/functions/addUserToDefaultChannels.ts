import { Meteor } from 'meteor/meteor';

import { Rooms, Subscriptions, Messages } from '../../../models/server';
import { IRoom } from '../../../../definition/IRoom';

export const addUserToDefaultChannels = function (user: Meteor.User, silenced: boolean): void {
	const defaultRooms = Rooms.findByDefaultAndTypes(true, ['c', 'p'], {
		fields: { usernames: 0 },
	}).fetch();
	defaultRooms.forEach((room: IRoom) => {
		if (!Subscriptions.findOneByRoomIdAndUserId(room._id, user._id)) {
			// Add a subscription to this user
			Subscriptions.createWithRoomAndUser(room, user, {
				ts: new Date(),
				open: true,
				alert: true,
				unread: 1,
				userMentions: 1,
				groupMentions: 0,
				...(room.favorite && { f: true }),
			});

			// Insert user joined message
			if (!silenced) {
				Messages.createUserJoinWithRoomIdAndUser(room._id, user);
			}
		}
	});
};
