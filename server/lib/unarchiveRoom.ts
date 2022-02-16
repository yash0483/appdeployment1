import { Rooms, Subscriptions } from '../../app/models/server';

export const unarchiveRoom = function (rid: string): void {
	Rooms.unarchiveById(rid);
	Subscriptions.unarchiveByRoomId(rid);
};
