import { camelCase } from 'lodash/fp'

import {
	CHANNEL_COLOUR_CHOICES,
	CUE_LIST_COUNT,
	DCA_COUNT,
	EQ_FREQUENCY_CHOICES,
	EQ_MAXIMUM_GAIN,
	EQ_MAXIMUM_WIDTH,
	EQ_MINIMUM_GAIN,
	EQ_MINIMUM_WIDTH,
	EQ_TYPE_CHOICES,
	FADER_LEVEL_CHOICES,
	HPF_FREQUENCY_CHOICES,
	INPUT_CHANNEL_COUNT,
	MUTE_GROUP_COUNT,
	PREAMP_MAXIMUM_GAIN,
	PREAMP_MINIMUM_GAIN,
	SCENE_COUNT,
	UFX_KEY_CHOICES,
	UFX_SCALE_CHOICES,
} from './constants.js'
import { ModuleInstance } from './main.js'
import { getChannelSelectOptions } from './utils/getChannelSelectOptions.js'
import { getChoices } from './utils/getInputFieldChoices.js'
import { getSocketSelectOptions } from './utils/getSocketSelectOptions.js'
import * as validators from './validators/index.js'

const toCamelCase = <const S extends string>(snakeCaseString: S): SnakeToCamel<S> =>
	camelCase(snakeCaseString) as SnakeToCamel<S>

export const UpdateActions = (companionModule: ModuleInstance): void => {
	companionModule.setActionDefinitions({
		mute: {
			name: 'Mute',
			options: [
				...getChannelSelectOptions(),
				{
					type: 'checkbox',
					label: 'Mute',
					id: 'mute',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseMuteAction(action)
				companionModule.sendCommand({
					command: options.mute ? 'mute_on' : 'mute_off',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
					},
				})
			},
		},

		faderLevel: {
			name: 'Fader Level',
			options: [
				...getChannelSelectOptions({ exclude: ['mute_group'] }),
				{
					type: 'dropdown',
					label: 'Level',
					id: 'level',
					default: 0,
					choices: FADER_LEVEL_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseFaderLevelAction(action)
				companionModule.sendCommand({
					command: 'fader_level',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						level: options.level,
					},
				})
			},
		},

		assignToMainMix: {
			name: 'Assign Channel to Main Mix',
			options: [
				...getChannelSelectOptions({
					exclude: [
						'mute_group',
						'dca',
						'mono_aux',
						'stereo_aux',
						'main',
						'mono_matrix',
						'stereo_matrix',
						'mono_fx_send',
						'stereo_fx_send',
						'stereo_ufx_send',
					],
				}),
				{
					type: 'checkbox',
					label: 'Assign to Main Mix',
					id: 'assign',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseAssignChannelToMainMixAction(action)
				companionModule.sendCommand({
					command: options.assign ? 'channel_assignment_to_main_mix_on' : 'channel_assignment_to_main_mix_off',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
					},
				})
			},
		},

		auxFxMatrixSendLevel: {
			name: 'Aux/FX/Matrix Send Level',
			options: [
				...getChannelSelectOptions({
					exclude: ['mono_aux', 'stereo_aux', 'mono_fx_send', 'stereo_fx_send', 'mono_matrix', 'stereo_matrix'],
				}),
				...getChannelSelectOptions({
					prefix: 'destination',
					exclude: [
						'input',
						'mono_group',
						'stereo_group',
						'fx_return',
						'main',
						'dca',
						'mute_group',
						'stereo_ufx_return',
						'stereo_ufx_send',
					],
				}),
				{
					type: 'dropdown',
					label: 'Level',
					id: 'level',
					default: 0,
					choices: FADER_LEVEL_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseAuxFxMatrixSendLevelAction(action)
				companionModule.sendCommand({
					command: 'aux_fx_matrix_send_level',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						destinationChannelType: options.destinationChannelType,
						destinationChannelNo: options[toCamelCase(`destination_${options.destinationChannelType}`)],
						level: options.level,
					},
				})
			},
		},

		inputToGroupAuxOn: {
			name: 'Input to Group/Aux On',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: 0,
					choices: getChoices('Input Channel', INPUT_CHANNEL_COUNT),
					minChoicesForSearch: 0,
				},
				...getChannelSelectOptions({
					prefix: 'destination',
					include: ['mono_group', 'stereo_group', 'mono_aux', 'stereo_aux'],
				}),
			],
			callback: async (action) => {
				const { options } = validators.parseInputToGroupAuxOnAction(action)
				companionModule.sendCommand({
					command: 'input_to_group_aux_on',
					params: {
						channelNo: options.input,
						destinationChannelType: options.destinationChannelType,
						destinationChannelNo: options[toCamelCase(`destination_${options.destinationChannelType}`)],
					},
				})
			},
		},

		dcaAssign: {
			name: 'Assign to DCA',
			options: [
				...getChannelSelectOptions({
					exclude: ['dca', 'mute_group'],
				}),
				{
					type: 'dropdown',
					label: 'DCA',
					id: 'destinationDca',
					default: 0,
					choices: getChoices('DCA', DCA_COUNT),
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'Assign to DCA',
					id: 'assign',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseDcaAssignAction(action)
				companionModule.sendCommand({
					command: options.assign ? 'dca_assignment_on' : 'dca_assignment_off',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						dcaNo: options.destinationDca,
					},
				})
			},
		},

		muteGroupAssign: {
			name: 'Assign to Mute Group',
			options: [
				...getChannelSelectOptions({
					exclude: ['dca', 'mute_group'],
				}),
				{
					type: 'dropdown',
					label: 'Mute Group',
					id: 'destinationMuteGroup',
					default: 0,
					choices: getChoices('Mute Group', MUTE_GROUP_COUNT),
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'Assign to Mute Group',
					id: 'assign',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseMuteGroupAssignAction(action)
				companionModule.sendCommand({
					command: options.assign ? 'mute_group_assignment_on' : 'mute_group_assignment_off',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						muteGroupNo: options.destinationMuteGroup,
					},
				})
			},
		},

		setSocketPreampGain: {
			name: 'Set Socket Preamp Gain',
			options: [
				...getSocketSelectOptions(),
				{
					type: 'number',
					label: 'Gain',
					id: 'gain',
					default: 0,
					min: PREAMP_MINIMUM_GAIN,
					max: PREAMP_MAXIMUM_GAIN,
					range: true,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetSocketPreampGainAction(action)
				companionModule.sendCommand({
					command: 'set_socket_preamp_gain',
					params: {
						socketType: options.socketType,
						socketNo: options[toCamelCase(options.socketType)],
						gain: options.gain,
					},
				})
			},
		},

		setSocketPreampPad: {
			name: 'Set Socket Preamp Pad',
			options: [
				...getSocketSelectOptions(),
				{
					type: 'checkbox',
					label: 'Pad',
					id: 'pad',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetSocketPreampPadAction(action)
				companionModule.sendCommand({
					command: 'set_socket_preamp_pad',
					params: {
						socketType: options.socketType,
						socketNo: options[toCamelCase(options.socketType)],
						shouldEnable: options.pad,
					},
				})
			},
		},

		setSocketPreamp48v: {
			name: 'Set Socket Preamp 48v',
			options: [
				...getSocketSelectOptions(),
				{
					type: 'checkbox',
					label: '48V',
					id: 'phantom',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetSocketPreamp48vAction(action)
				companionModule.sendCommand({
					command: 'set_socket_preamp_48v',
					params: {
						socketType: options.socketType,
						socketNo: options[toCamelCase(options.socketType)],
						shouldEnable: options.phantom,
					},
				})
			},
		},

		setChannelName: {
			name: 'Set Channel Name',
			options: [
				...getChannelSelectOptions(),
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: '',
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetChannelNameAction(action)
				companionModule.sendCommand({
					command: 'set_channel_name',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						name: options.name,
					},
				})
			},
		},

		setChannelColour: {
			name: 'Set Channel Colour',
			options: [
				...getChannelSelectOptions(),
				{
					type: 'dropdown',
					label: 'Colour',
					id: 'colour',
					default: 0,
					choices: CHANNEL_COLOUR_CHOICES,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetChannelColourAction(action)
				companionModule.sendCommand({
					command: 'set_channel_colour',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						colour: options.colour,
					},
				})
			},
		},

		recallScene: {
			name: 'Recall Scene (MixRack Only)',
			options: [
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: 0,
					choices: getChoices('Scene', SCENE_COUNT),
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseRecallSceneAction(action)
				companionModule.sendCommand({
					command: 'scene_recall',
					params: {
						sceneNo: options.scene,
					},
				})
			},
		},

		recallCueList: {
			name: 'Recall Cue List (Surface Only)',
			options: [
				{
					type: 'dropdown',
					label: 'Recall ID',
					id: 'recallId',
					default: 0,
					choices: getChoices('ID', CUE_LIST_COUNT),
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseRecallCueListAction(action)
				companionModule.sendCommand({
					command: 'cue_list_recall',
					params: {
						recallId: options.recallId,
					},
				})
			},
		},

		goNextPrevious: {
			name: 'Go Next/Previous (Surface Only)',
			description: 'The MIDI CC messages for Go/Next/Previous are defined in the console settings',
			options: [
				{
					type: 'number',
					min: 0,
					max: 127,
					label: 'Control Number',
					id: 'controlNumber',
					default: 0,
				},
				{
					type: 'number',
					min: 0,
					max: 127,
					label: 'Control Value',
					id: 'controlValue',
					default: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseGoNextPreviousAction(action)
				companionModule.sendCommand({
					command: 'go_next_previous',
					params: {
						controlNumber: options.controlNumber,
						controlValue: options.controlValue,
					},
				})
			},
		},

		parametricEq: {
			name: 'Parametric EQ',
			options: [
				...getChannelSelectOptions(),
				{
					type: 'dropdown',
					label: 'Band',
					id: 'band',
					default: 0,
					choices: getChoices('Band', 4),
					minChoicesForSearch: 0,
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'bell',
					choices: EQ_TYPE_CHOICES,
					minChoicesForSearch: 0,
					isVisibleExpression: `$(options:band) == 0 || $(options:band) == 3`,
				},
				{
					type: 'dropdown',
					label: 'Frequency',
					id: 'frequency',
					default: 72, // 1kHz
					choices: EQ_FREQUENCY_CHOICES,
				},
				{
					type: 'number',
					label: 'Width',
					id: 'width',
					default: 1,
					max: EQ_MAXIMUM_WIDTH,
					min: EQ_MINIMUM_WIDTH,
					step: 0.05,
					range: true,
					isVisibleExpression: `$(options:type) == 'bell'`,
				},
				{
					type: 'number',
					label: 'Gain',
					id: 'gain',
					default: 0,
					min: EQ_MINIMUM_GAIN,
					max: EQ_MAXIMUM_GAIN,
					range: true,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseParametricEqAction(action)
				companionModule.sendCommand({
					command: 'parametric_eq',
					params: {
						channelType: options.channelType,
						channelNo: options[toCamelCase(options.channelType)],
						bandNo: options.band,
						type: options.type,
						frequency: options.frequency,
						width: options.width,
						gain: options.gain,
					},
				})
			},
		},

		hpfFrequency: {
			name: 'HPF Frequency',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: 0,
					choices: getChoices('Input Channel', INPUT_CHANNEL_COUNT),
					minChoicesForSearch: 0,
				},
				{
					type: 'dropdown',
					label: 'Frequency',
					id: 'frequency',
					default: 72, // 1kHz
					choices: HPF_FREQUENCY_CHOICES,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseHpfFrequencyAction(action)
				companionModule.sendCommand({
					command: 'hpf_frequency',
					params: {
						channelNo: options.input,
						frequency: options.frequency,
					},
				})
			},
		},

		setHpfOnOff: {
			name: 'Set HPF On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: 0,
					choices: getChoices('Input Channel', INPUT_CHANNEL_COUNT),
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'HPF',
					id: 'hpf',
					default: true,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetHpfOnOffAction(action)
				companionModule.sendCommand({
					command: 'set_hpf_on_off',
					params: {
						channelNo: options.input,
						shouldEnable: options.hpf,
					},
				})
			},
		},

		setUfxGlobalKey: {
			name: 'Set UFX Global Key',
			options: [
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: 0,
					choices: UFX_KEY_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetUfxGlobalKeyAction(action)
				companionModule.sendCommand({
					command: 'set_ufx_global_key',
					params: {
						key: options.key,
					},
				})
			},
		},

		setUfxGlobalScale: {
			name: 'Set UFX Global Scale',
			options: [
				{
					type: 'dropdown',
					label: 'Scale',
					id: 'scale',
					default: 0,
					choices: UFX_SCALE_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetUfxGlobalScaleAction(action)
				companionModule.sendCommand({
					command: 'set_ufx_global_scale',
					params: {
						scale: options.scale,
					},
				})
			},
		},

		setUfxUnitParameter: {
			name: 'Set UFX Unit Parameter',
			description: 'The MIDI channel and control messages for each UFX unit are defined in the console settings',
			options: [
				{
					type: 'number',
					min: 1,
					max: 16,
					label: 'MIDI Channel',
					id: 'midiChannel',
					default: 1,
				},
				{
					type: 'number',
					min: 0,
					max: 127,
					label: 'Control Number',
					id: 'controlNumber',
					default: 0,
				},
				{
					type: 'number',
					min: 0,
					max: 127,
					label: 'Control Value',
					id: 'controlValue',
					default: 0,
				},
			],
			callback: async (action) => {
				const { options } = validators.parseSetUfxUnitParameterAction(action)
				companionModule.sendCommand({
					command: 'set_ufx_unit_parameter',
					params: {
						midiChannel: options.midiChannel - 1,
						controlNumber: options.controlNumber,
						value: options.controlValue,
					},
				})
			},
		},
	})
}
