import { IRocketChatRecord } from './IRocketChatRecord';

export interface IWebdavAccount extends IRocketChatRecord {
	userId: string;
	serverURL: string;
	username: string;
	password: string;
	name: string;
}

export type WebdavAccountIntegration = Omit<IWebdavAccount, 'userId' | 'password' | '_updatedAt'>;

export type IWebdavAccountPayload = Omit<IWebdavAccount, 'userId' | '_id' | '_updatedAt'>;
