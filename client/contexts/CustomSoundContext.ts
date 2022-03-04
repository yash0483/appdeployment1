import { createContext, useContext } from 'react';

// TODO: not sure if this context is needed
import type { CustomSounds } from '../../app/custom-sounds/client';

type CustomSoundContextValue = typeof CustomSounds;

export const CustomSoundContext = createContext<CustomSoundContextValue | undefined>(undefined);

export const useCustomSound = (): CustomSoundContextValue => {
	const result = useContext(CustomSoundContext);
	if (result === undefined) {
		throw new Error('useCustomSound must be used within a CustomSoundContext');
	}
	return result;
};
