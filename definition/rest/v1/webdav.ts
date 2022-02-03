import type { IWebdavAccountIntegration } from '../../IWebdavAccount';

export type WebdavEndpoints = {
	'webdav.getMyAccounts': {
		GET: () => { accounts: Array<IWebdavAccountIntegration> };
	};
};
