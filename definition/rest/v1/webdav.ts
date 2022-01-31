import type { WebdavAccountIntegration } from '../../IWebdavAccount';

export type WebdavEndpoints = {
	'webdav.getMyAccounts': {
		GET: () => { accounts: Array<WebdavAccountIntegration> };
	};
};
