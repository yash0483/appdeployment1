// export type AddWebdavAccountMethod = (data: IWebdavAccountPayload) => void;
import { IWebdavAccount } from '../../../../definition/IWebdavAccount';
import { TranslationKey } from '../../TranslationContext';

export type UploadFileToWebdav = (
	accountId: IWebdavAccount['_id'],
	fileData: Uint8Array,
	name?: string,
) => { success: boolean; message: TranslationKey };
