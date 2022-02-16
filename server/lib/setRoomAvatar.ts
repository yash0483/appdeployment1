import { Meteor } from 'meteor/meteor';

import { RocketChatFile } from '../../app/file';
import { FileUpload } from '../../app/file-upload/server';
import { Rooms, Messages } from '../../app/models/server';
import { Avatars } from '../../app/models/server/raw';
import { api } from '../sdk/api';

export const setRoomAvatar = async function (rid: string, dataURI: string, user: Meteor.User): Promise<void> {
	const fileStore = FileUpload.getStore('Avatars');

	const current = await Avatars.findOneByRoomId(rid);

	if (!dataURI) {
		fileStore.deleteByRoomId(rid);
		Messages.createRoomSettingsChangedWithTypeRoomIdMessageAndUser('room_changed_avatar', rid, '', user);
		api.broadcast('room.avatarUpdate', { _id: rid });

		return Rooms.unsetAvatarData(rid);
	}

	const fileData = RocketChatFile.dataURIParse(dataURI);

	const buffer = Buffer.from(fileData.image, 'base64');

	const file = {
		rid,
		type: fileData.contentType,
		size: buffer.length,
		uid: user._id,
	};

	fileStore.insert(file, buffer, (err: string | object, result: Record<string, any>) => {
		if (err) {
			throw err;
		}

		Meteor.setTimeout(function () {
			if (current) {
				fileStore.deleteById(current._id);
			}
			Rooms.setAvatarData(rid, 'upload', result.etag);
			Messages.createRoomSettingsChangedWithTypeRoomIdMessageAndUser('room_changed_avatar', rid, '', user);
			api.broadcast('room.avatarUpdate', { _id: rid, avatarETag: result.etag });
		}, 500);
	});
};
