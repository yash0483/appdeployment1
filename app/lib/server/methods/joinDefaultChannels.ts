import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { addUserToDefaultChannels } from '../../../../server/lib/addUserToDefaultChannels';

Meteor.methods({
	joinDefaultChannels(silenced) {
		check(silenced, Match.Optional(Boolean));
		const user = Meteor.user();
		if (!Meteor.userId() || !user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'joinDefaultChannels',
			});
		}
		return addUserToDefaultChannels(user, silenced);
	},
});
