import { getUserAvatarURL } from '../../../utils/lib/getUserAvatarURL';
import { roomTypes } from '../../../utils/server';
import { IMessage } from '../../../../definition/IMessage';
import { IRoom } from '../../../../definition/IRoom';
import { MessageAttachment } from '../../../../definition/IMessage/MessageAttachment/MessageAttachment';

export const attachMessage = function (
	message: IMessage,
	room: IRoom,
): {
	text: string;
	authorName?: string;
	authorIcon: string;
	messageLink: string;
	attachments?: MessageAttachment[];
	ts: Date;
} {
	const {
		msg,
		u: { username },
		ts,
		attachments,
		_id,
	} = message;
	return {
		text: msg,
		authorName: username,
		authorIcon: getUserAvatarURL(username),
		messageLink: `${roomTypes.getRouteLink(room.t, room)}?msg=${_id}`,
		attachments,
		ts,
	};
};
