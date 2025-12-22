import { SomeCompanionActionInputField } from '@companion-module/base'

import { SOCKET_TYPE_CHOICES, MIXRACK_SOCKET_COUNT, MIXRACK_DX_SOCKET_COUNT } from '../constants.js'
import { getChoices } from './getInputFieldChoices.js'

export const getSocketSelectOptions = (): SomeCompanionActionInputField[] => {
	return [
		{
			type: 'dropdown',
			label: 'Socket Type',
			id: 'socket_type',
			default: SOCKET_TYPE_CHOICES[0].id,
			choices: SOCKET_TYPE_CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'dropdown',
			label: 'Mixrack Sockets 1-64',
			id: 'mixrack_sockets_1_64',
			default: 0,
			choices: getChoices('Socket', MIXRACK_SOCKET_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:socket_type) == "mixrack_sockets_1_64"`,
		},
		{
			type: 'dropdown',
			label: 'Mixrack DX 1/2 1-32',
			id: 'mixrack_dx_1_2',
			default: 0,
			choices: getChoices('Socket', MIXRACK_DX_SOCKET_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:socket_type) == "mixrack_dx_1_2"`,
		},
		{
			type: 'dropdown',
			label: 'Mixrack DX 3/4 1-32',
			id: 'mixrack_dx_3_4',
			default: 0,
			choices: getChoices('Socket', MIXRACK_DX_SOCKET_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:socket_type) == "mixrack_dx_3_4"`,
		},
	]
}
