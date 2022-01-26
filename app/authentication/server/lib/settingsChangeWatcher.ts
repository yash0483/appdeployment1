import { ServerEvents } from '../../../models/server/raw';
import { settings } from '../../../settings/server';
import { IServerEventType } from '../../../../definition/IServerEvent';
import { SettingValue } from '../../../../definition/ISetting';
import { Logger } from '../../../logger/server';

const logger = new Logger('SettingChangeWatcher');

export const storeSettingChanged = async (settingId: string, targetValue: SettingValue, uid = 'system'): Promise<void> => {
	const currentSetting = settings.get(settingId);
	if (currentSetting === targetValue) {
		logger.debug(`Cannot store change metadata for ${settingId}. Setting didn't change`);
		return;
	}
	const event = {
		t: IServerEventType.SETTING_MODIFIED,
		ts: new Date(),
		u: {
			_id: uid,
		},
		extraData: {
			settingId,
			prevValue: currentSetting,
			targetValue,
		},
	};

	try {
		logger.debug(`Setting ${settingId} changed by ${uid}`);
		await ServerEvents.insertOne(event);
	} catch (err) {
		logger.error({ msg: 'An error ocurred while storing setting audit metadata', err, settingId });
	}
};
