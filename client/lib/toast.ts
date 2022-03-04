import { Emitter } from '@rocket.chat/emitter';
import type toastr from 'toastr';

export type ToastMessagePayload = {
	type: 'success' | 'info' | 'warning' | 'error';
	message: string | Error;
	title?: string;
	options?: typeof toastr['options'];
};

const emitter = new Emitter<{
	notify: ToastMessagePayload;
}>();

export const dispatchToastMessage = (payload: ToastMessagePayload): void => {
	// TODO: buffer it if there is no subscriber
	emitter.emit('notify', payload);
};

export const subscribeToToastMessages = (callback: (payload: ToastMessagePayload) => void): (() => void) => emitter.on('notify', callback);
