import { SomeCompanionActionInputField } from '@companion-module/base'
import { compact, includes, join, pipe } from 'lodash/fp'

import {
	ChannelType,
	CHANNEL_TYPE_CHOICES,
	INPUT_CHANNEL_COUNT,
	MONO_GROUP_COUNT,
	STEREO_GROUP_COUNT,
	MONO_AUX_COUNT,
	STEREO_AUX_COUNT,
	MONO_MATRIX_COUNT,
	STEREO_MATRIX_COUNT,
	MONO_FX_SEND_COUNT,
	STEREO_FX_SEND_COUNT,
	FX_RETURN_COUNT,
	MAIN_COUNT,
	DCA_COUNT,
	MUTE_GROUP_COUNT,
	STEREO_UFX_SEND_COUNT,
	STEREO_UFX_RETURN_COUNT,
} from '../constants.js'
import { getChoices } from './getInputFieldChoices.js'
import { capitalize } from 'lodash'

const prependPrefix = (text: string, prefix?: string) => pipe(compact, join('_'))([prefix, text])

interface GetChannelSelectOptionsArgs {
	exclude?: ChannelType[]
	prefix?: string
}

export const getChannelSelectOptions = (args?: GetChannelSelectOptionsArgs): SomeCompanionActionInputField[] => {
	const exclude = args?.exclude ?? []
	const prefix = args?.prefix

	const channelTypeLabel = prefix ? join(' ', [capitalize(prefix), 'Channel Type']) : 'Channel Type'
	const filteredChannelTypeChoices = CHANNEL_TYPE_CHOICES.filter((c) => !includes(c.id, exclude))

	return [
		{
			type: 'dropdown',
			label: channelTypeLabel,
			id: prependPrefix('channel_type', prefix),
			default: filteredChannelTypeChoices[0].id,
			choices: filteredChannelTypeChoices,
			minChoicesForSearch: 0,
		},
		{
			type: 'dropdown',
			label: 'Input Channel',
			id: prependPrefix('input', prefix),
			default: 0,
			choices: getChoices('Input Channel', INPUT_CHANNEL_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "input"`,
		},
		{
			type: 'dropdown',
			label: 'Mono Group',
			id: prependPrefix('mono_group', prefix),
			default: 0,
			choices: getChoices('Mono Group', MONO_GROUP_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "mono_group"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo Group',
			id: prependPrefix('stereo_group', prefix),
			default: 0,
			choices: getChoices('Stereo Group', STEREO_GROUP_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_group"`,
		},
		{
			type: 'dropdown',
			label: 'Mono Aux',
			id: prependPrefix('mono_aux', prefix),
			default: 0,
			choices: getChoices('Mono Aux', MONO_AUX_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "mono_aux"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo Aux',
			id: prependPrefix('stereo_aux', prefix),
			default: 0,
			choices: getChoices('Stereo Aux', STEREO_AUX_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_aux"`,
		},
		{
			type: 'dropdown',
			label: 'Mono Matrix',
			id: prependPrefix('mono_matrix', prefix),
			default: 0,
			choices: getChoices('Mono Matrix', MONO_MATRIX_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "mono_matrix"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo Matrix',
			id: prependPrefix('stereo_matrix', prefix),
			default: 0,
			choices: getChoices('Stereo Matrix', STEREO_MATRIX_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_matrix"`,
		},
		{
			type: 'dropdown',
			label: 'Mono FX Send',
			id: prependPrefix('mono_fx_send', prefix),
			default: 0,
			choices: getChoices('Mono FX Send', MONO_FX_SEND_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "mono_fx_send"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo FX Send',
			id: prependPrefix('stereo_fx_send', prefix),
			default: 0,
			choices: getChoices('Stereo FX Send', STEREO_FX_SEND_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_fx_send"`,
		},
		{
			type: 'dropdown',
			label: 'FX Return',
			id: prependPrefix('fx_return', prefix),
			default: 0,
			choices: getChoices('FX Return', FX_RETURN_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "fx_return"`,
		},
		{
			type: 'dropdown',
			label: 'Main',
			id: prependPrefix('main', prefix),
			default: 0,
			choices: getChoices('Main', MAIN_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "main"`,
		},
		{
			type: 'dropdown',
			label: 'DCA',
			id: prependPrefix('dca', prefix),
			default: 0,
			choices: getChoices('DCA', DCA_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "dca"`,
		},
		{
			type: 'dropdown',
			label: 'Mute Group',
			id: prependPrefix('mute_group', prefix),
			default: 0,
			choices: getChoices('Mute Group', MUTE_GROUP_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "mute_group"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo UFX Send',
			id: prependPrefix('stereo_ufx_send', prefix),
			default: 0,
			choices: getChoices('Stereo UFX Send', STEREO_UFX_SEND_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_ufx_send"`,
		},
		{
			type: 'dropdown',
			label: 'Stereo UFX Return',
			id: prependPrefix('stereo_ufx_return', prefix),
			default: 0,
			choices: getChoices('Stereo UFX Return', STEREO_UFX_RETURN_COUNT),
			minChoicesForSearch: 0,
			isVisibleExpression: `$(options:${prependPrefix('channel_type', prefix)}) == "stereo_ufx_return"`,
		},
	]
}
