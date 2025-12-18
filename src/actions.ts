import { times } from 'lodash/fp'
import { ModuleInstance } from './main.js'
import { SomeCompanionActionInputField } from '@companion-module/base'

type OptionChoice = {
	label: string
	id: number
}

type OptionGetterFn = (name: string, qty: number, ofs: number) => SomeCompanionActionInputField[]

const INPUT_CHANNEL_COUNT = 128
const DCA_COUNT = 24
const SCENE_COUNT = 500
const MUTE_COUNT = 8
const FADER_STEP_COUNT = 128
const GAIN_STEP_COUNT = 128

const INPUT_CHANNEL_CHOICES: OptionChoice[] = times((id: number) => ({ label: `CH ${id + 1}`, id }))(
	INPUT_CHANNEL_COUNT,
)

const SCENE_CHOICES: OptionChoice[] = times((id: number) => ({ label: `SCENE ${id + 1}`, id }))(SCENE_COUNT)

const DCA_CHOICES: OptionChoice[] = times((id: number) => ({ label: `DCA ${id + 1}`, id }))(DCA_COUNT)

const MUTE_CHOICES: OptionChoice[] = times((id: number) => ({ label: `MUTE ${id + 1}`, id }))(MUTE_COUNT)

const FADER_CHOICES: OptionChoice[] = times((id: number) => {
	const dbVal = ((id - 107) / 2).toFixed(1)
	// @ts-expect-error TODO - investigate later
	const dbStr = id == 0 ? '-INF' : dbVal == 0 ? dbVal : dbVal > 0 ? `+${dbVal}` : `-${dbVal}`
	return { label: `${dbStr} dB`, id }
})(FADER_STEP_COUNT)

// Preamp Gain Control
const GAIN_CHOICES: OptionChoice[] = times((id: number) => {
	const gainVal = ((id * 60) / 127 - 10).toFixed(1) // -10dB to +50dB range
	// @ts-expect-error TODO - investigate later
	const gainStr = gainVal == 0 ? '0' : gainVal > 0 ? `+${gainVal}` : gainVal
	return { label: `${gainStr} dB`, id }
})(GAIN_STEP_COUNT)

// High Pass Filter Control
const HPF_CHOICES = [
	{ label: 'Off', id: 0 },
	{ label: '20 Hz', id: 1 },
	{ label: '25 Hz', id: 2 },
	{ label: '31.5 Hz', id: 3 },
	{ label: '40 Hz', id: 4 },
	{ label: '50 Hz', id: 5 },
	{ label: '63 Hz', id: 6 },
	{ label: '80 Hz', id: 7 },
	{ label: '100 Hz', id: 8 },
	{ label: '125 Hz', id: 9 },
	{ label: '160 Hz', id: 10 },
	{ label: '200 Hz', id: 11 },
	{ label: '250 Hz', id: 12 },
	{ label: '315 Hz', id: 13 },
	{ label: '400 Hz', id: 14 },
]

// UFX Global Key Control
const UFX_KEY_CHOICES = [
	{ label: 'C', id: 0x00 },
	{ label: 'C#', id: 0x01 },
	{ label: 'D', id: 0x02 },
	{ label: 'D#', id: 0x03 },
	{ label: 'E', id: 0x04 },
	{ label: 'F', id: 0x05 },
	{ label: 'F#', id: 0x06 },
	{ label: 'G', id: 0x07 },
	{ label: 'G#', id: 0x08 },
	{ label: 'A', id: 0x09 },
	{ label: 'A#', id: 0x0a },
	{ label: 'B', id: 0x0b },
]

// UFX Global Scale Control
const UFX_SCALE_CHOICES = [
	{ label: 'Major', id: 0x00 },
	{ label: 'Minor', id: 0x01 },
]

const getMuteOptions: OptionGetterFn = (name, qty, ofs) => {
	const CHOICES = []
	for (let i = 1; i <= qty; i++) {
		CHOICES.push({ label: `${name} ${i}`, id: i + ofs })
	}

	return [
		{
			type: 'dropdown',
			label: name,
			id: 'strip',
			default: 1 + ofs,
			choices: CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'checkbox',
			label: 'Mute',
			id: 'mute',
			default: true,
		},
	]
}

const getPhantomOptions: OptionGetterFn = (name, qty, ofs) => {
	const CHOICES = []
	for (let i = 1; i <= qty; i++) {
		CHOICES.push({ label: `${name} ${i}`, id: i + ofs })
	}

	return [
		{
			type: 'dropdown',
			label: name,
			id: 'strip',
			default: 1 + ofs,
			choices: CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'checkbox',
			label: 'Phantom',
			id: 'phantom',
			default: true,
		},
	]
}

const getFaderOptions: OptionGetterFn = (name, qty, ofs) => {
	const CHOICES = []
	for (let i = 1; i <= qty; i++) {
		CHOICES.push({ label: `${name} ${i}`, id: i + ofs })
	}

	return [
		{
			type: 'dropdown',
			label: name,
			id: 'strip',
			default: 1 + ofs,
			choices: CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'dropdown',
			label: 'Level',
			id: 'level',
			default: 0,
			choices: FADER_CHOICES,
			minChoicesForSearch: 0,
		},
	]
}

// Send Level Controls
const getSendLevelOptions: OptionGetterFn = (name, qty, ofs) => {
	const CHOICES = []
	for (let i = 1; i <= qty; i++) {
		CHOICES.push({ label: `${name} ${i}`, id: i + ofs })
	}
	return [
		{
			type: 'dropdown',
			label: 'Input Channel',
			id: 'inputChannel',
			default: 0,
			choices: INPUT_CHANNEL_CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'dropdown',
			label: name,
			id: 'send',
			default: 1 + ofs,
			choices: CHOICES,
			minChoicesForSearch: 0,
		},
		{
			type: 'dropdown',
			label: 'Send Level',
			id: 'level',
			default: 0,
			choices: FADER_CHOICES,
			minChoicesForSearch: 0,
		},
	]
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		mute_input: {
			name: 'Mute Input',
			options: getMuteOptions('Input Channel', 128, -1),
			callback: async (action) => {
				self.sendAction('mute_input', action.options)
			},
		},
		mute_mono_group: {
			name: 'Mute Mono Group',
			options: getMuteOptions('Mono Group', 62, -1),
			callback: async (action) => {
				self.sendAction('mute_mono_group', action.options)
			},
		},
		mute_stereo_group: {
			name: 'Mute Stereo Group',
			options: getMuteOptions('Stereo Group', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('mute_stereo_group', action.options)
			},
		},
		mute_mono_aux: {
			name: 'Mute Mono Aux',
			options: getMuteOptions('Mono Aux', 62, -1),
			callback: async (action) => {
				self.sendAction('mute_mono_aux', action.options)
			},
		},
		mute_stereo_aux: {
			name: 'Mute Stereo Aux',
			options: getMuteOptions('Stereo Aux', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('mute_stereo_aux', action.options)
			},
		},
		mute_mono_matrix: {
			name: 'Mute Mono Matrix',
			options: getMuteOptions('Mono Matrix', 62, -1),
			callback: async (action) => {
				self.sendAction('mute_mono_matrix', action.options)
			},
		},
		mute_stereo_matrix: {
			name: 'Mute Stereo Matrix',
			options: getMuteOptions('Stereo Matrix', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('mute_stereo_matrix', action.options)
			},
		},
		mute_mono_fx_send: {
			name: 'Mute Mono FX Send',
			options: getMuteOptions('Mono FX Send', 16, -1),
			callback: async (action) => {
				self.sendAction('mute_mono_fx_send', action.options)
			},
		},
		mute_stereo_fx_send: {
			name: 'Mute Stereo FX Send',
			options: getMuteOptions('Stereo FX Send', 16, 0x0f),
			callback: async (action) => {
				self.sendAction('mute_stereo_fx_send', action.options)
			},
		},
		mute_fx_return: {
			name: 'Mute FX Return',
			options: getMuteOptions('FX Return', 16, 0x1f),
			callback: async (action) => {
				self.sendAction('mute_fx_return', action.options)
			},
		},
		mute_master: {
			name: 'Mute Group Master',
			options: getMuteOptions('Mute Group Master', 8, 0x4d),
			callback: async (action) => {
				self.sendAction('mute_master', action.options)
			},
		},
		mute_dca: {
			name: 'Mute DCA',
			options: getMuteOptions('DCA', 24, 0x35),
			callback: async (action) => {
				self.sendAction('mute_dca', action.options)
			},
		},
		mute_ufx_send: {
			name: 'Mute UFX Stereo Send',
			options: getMuteOptions('UFX Stereo Send', 8, 0x55),
			callback: async (action) => {
				self.sendAction('mute_ufx_send', action.options)
			},
		},
		mute_ufx_return: {
			name: 'Mute UFX Stereo Return',
			options: getMuteOptions('UFX Stereo Return', 8, 0x5d),
			callback: async (action) => {
				self.sendAction('mute_ufx_return', action.options)
			},
		},
		fader_input: {
			name: 'Set Input Fader to Level',
			options: getFaderOptions('Channel', 128, -1),
			callback: async (action) => {
				self.sendAction('fader_input', action.options)
			},
		},
		fader_mono_group: {
			name: 'Set Mono Group Master Fader to Level',
			options: getFaderOptions('Mono Group', 62, -1),
			callback: async (action) => {
				self.sendAction('fader_mono_group', action.options)
			},
		},
		fader_stereo_group: {
			name: 'Set Stereo Group Master Fader to Level',
			options: getFaderOptions('Stereo Group', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('fader_stereo_group', action.options)
			},
		},
		fader_mono_aux: {
			name: 'Set Mono Aux Master Fader to Level',
			options: getFaderOptions('Mono Aux', 62, -1),
			callback: async (action) => {
				self.sendAction('fader_mono_aux', action.options)
			},
		},
		fader_stereo_aux: {
			name: 'Set Stereo Aux Master Fader to Level',
			options: getFaderOptions('Stereo Aux', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('fader_stereo_aux', action.options)
			},
		},
		fader_mono_matrix: {
			name: 'Set Mono Matrix Master Fader to Level',
			options: getFaderOptions('Mono Matrix', 62, -1),
			callback: async (action) => {
				self.sendAction('fader_mono_matrix', action.options)
			},
		},
		fader_stereo_matrix: {
			name: 'Set Stereo Matrix Master Fader to Level',
			options: getFaderOptions('Stereo Matrix', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('fader_stereo_matrix', action.options)
			},
		},
		fader_mono_fx_send: {
			name: 'Set Mono FX Send Master Fader to Level',
			options: getFaderOptions('Mono FX Send', 16, -1),
			callback: async (action) => {
				self.sendAction('fader_mono_fx_send', action.options)
			},
		},
		fader_stereo_fx_send: {
			name: 'Set Stereo FX Send Master Fader to Level',
			options: getFaderOptions('Stereo FX Send', 16, 0x0f),
			callback: async (action) => {
				self.sendAction('fader_stereo_fx_send', action.options)
			},
		},
		fader_fx_return: {
			name: 'Set FX Return Fader to Level',
			options: getFaderOptions('FX Return', 16, 0x1f),
			callback: async (action) => {
				self.sendAction('fader_fx_return', action.options)
			},
		},
		fader_DCA: {
			name: 'Set DCA Fader to Level',
			options: getFaderOptions('DCA', 24, 0x35),
			callback: async (action) => {
				self.sendAction('fader_DCA', action.options)
			},
		},
		fader_ufx_send: {
			name: 'Set UFX Stereo Send Fader to Level',
			options: getFaderOptions('UFX Stereo Send', 8, 0x55),
			callback: async (action) => {
				self.sendAction('fader_ufx_send', action.options)
			},
		},
		fader_ufx_return: {
			name: 'Set UFX Stereo Return Fader to Level',
			options: getFaderOptions('UFX Stereo Return', 8, 0x5d),
			callback: async (action) => {
				self.sendAction('fader_ufx_return', action.options)
			},
		},
		phantom: {
			name: 'Toggle 48v Phantom on Preamp',
			options: getPhantomOptions('Preamp', INPUT_CHANNEL_COUNT, -1),
			callback: async (action) => {
				self.sendAction('phantom', action.options)
			},
		},
		dca_assign: {
			name: 'Assign DCA Groups for channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'inputChannel',
					default: '0',
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'multidropdown',
					label: 'DCA',
					id: 'dcaGroup',
					default: [],
					choices: DCA_CHOICES,
				},
			],
			callback: async (action) => {
				self.sendAction('dca_assign', action.options)
			},
		},
		mute_assign: {
			name: 'Assign Mute Groups for channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'inputChannel',
					default: '0',
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'multidropdown',
					label: 'MUTE',
					id: 'muteGroup',
					default: [],
					choices: MUTE_CHOICES,
				},
			],
			callback: async (action) => {
				self.sendAction('mute_assign', action.options)
			},
		},
		vsc: {
			name: 'Virtual Soundcheck',
			options: [
				{
					type: 'dropdown',
					label: 'VSC Mode',
					id: 'vscMode',
					default: 0,
					choices: [
						{ label: 'Inactive', id: 0 },
						{ label: 'Record Send', id: 1 },
						{ label: 'Virtual SoundCheck', id: 2 },
					],
				},
			],
			callback: async (action) => {
				self.sendAction('vsc', action.options)
			},
		},
		talkback_on: {
			name: 'Talkback On',
			options: [
				{
					type: 'checkbox',
					label: 'ON',
					id: 'on',
					default: true,
				},
			],
			callback: async (action) => {
				self.sendAction('talkback_on', action.options)
			},
		},
		scene_recall: {
			name: 'Scene recall',
			options: [
				{
					type: 'dropdown',
					label: 'Scene Number',
					id: 'sceneNumber',
					default: '0',
					choices: SCENE_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				self.sendAction('scene_recall', action.options)
			},
		},
		scene_next: {
			name: 'Scene Go Next',
			options: [],
			callback: async (action) => {
				self.sendAction('scene_next', action.options)
			},
		},
		scene_previous: {
			name: 'Scene Go Previous',
			options: [],
			callback: async (action) => {
				self.sendAction('scene_previous', action.options)
			},
		},
		solo_input: {
			name: 'Solo Input Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'Solo',
					id: 'solo',
					default: true,
				},
			],
			callback: async (action) => {
				self.sendAction('solo_input', action.options)
			},
		},
		eq_enable_input: {
			name: 'EQ Enable/Disable Input Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'EQ Enable',
					id: 'enable',
					default: true,
				},
			],
			callback: async (action) => {
				self.sendAction('eq_enable_input', action.options)
			},
		},
		preamp_gain: {
			name: 'Set Preamp Gain',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'dropdown',
					label: 'Gain Level',
					id: 'gain',
					default: 42, // Approximately 0dB
					choices: GAIN_CHOICES,
					minChoicesForSearch: 0,
				},
			],
			callback: async (action) => {
				self.sendAction('preamp_gain', action.options)
			},
		},
		preamp_pad: {
			name: 'Toggle Preamp Pad',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'Pad (-20dB)',
					id: 'pad',
					default: true,
				},
			],
			callback: async (action) => {
				self.sendAction('preamp_pad', action.options)
			},
		},
		hpf_control: {
			name: 'Set High Pass Filter',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'dropdown',
					label: 'HPF Frequency',
					id: 'frequency',
					default: 0,
					choices: HPF_CHOICES,
				},
			],
			callback: async (action) => {
				self.sendAction('hpf_control', action.options)
			},
		},
		send_aux_mono: {
			name: 'Set Aux Mono Send Level',
			options: getSendLevelOptions('Mono Aux', 62, -1),
			callback: async (action) => {
				self.sendAction('send_aux_mono', action.options)
			},
		},
		send_aux_stereo: {
			name: 'Set Aux Stereo Send Level',
			options: getSendLevelOptions('Stereo Aux', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('send_aux_stereo', action.options)
			},
		},
		send_fx_mono: {
			name: 'Set FX Mono Send Level',
			options: getSendLevelOptions('Mono FX', 16, -1),
			callback: async (action) => {
				self.sendAction('send_fx_mono', action.options)
			},
		},
		send_fx_stereo: {
			name: 'Set FX Stereo Send Level',
			options: getSendLevelOptions('Stereo FX', 16, 0x0f),
			callback: async (action) => {
				self.sendAction('send_fx_stereo', action.options)
			},
		},
		send_matrix_mono: {
			name: 'Set Matrix Mono Send Level',
			options: getSendLevelOptions('Mono Matrix', 62, -1),
			callback: async (action) => {
				self.sendAction('send_matrix_mono', action.options)
			},
		},
		send_matrix_stereo: {
			name: 'Set Matrix Stereo Send Level',
			options: getSendLevelOptions('Stereo Matrix', 31, 0x3f),
			callback: async (action) => {
				self.sendAction('send_matrix_stereo', action.options)
			},
		},
		send_ufx: {
			name: 'Set UFX Stereo Send Level',
			options: getSendLevelOptions('UFX Stereo Send', 8, 0x55),
			callback: async (action) => {
				self.sendAction('send_ufx', action.options)
			},
		},
		ufx_global_key: {
			name: 'Set UFX Global Key',
			options: [
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: 0x00,
					choices: UFX_KEY_CHOICES,
				},
			],
			callback: async (action) => {
				self.sendAction('ufx_global_key', action.options)
			},
		},
		ufx_global_scale: {
			name: 'Set UFX Global Scale',
			options: [
				{
					type: 'dropdown',
					label: 'Scale',
					id: 'scale',
					default: 0x00,
					choices: UFX_SCALE_CHOICES,
				},
			],
			callback: async (action) => {
				self.sendAction('ufx_global_scale', action.options)
			},
		},
		ufx_unit_parameter: {
			name: 'Set UFX Unit Parameter',
			options: [
				{
					type: 'number',
					label: 'UFX MIDI Channel (M)',
					id: 'midiChannel',
					default: 1,
					min: 1,
					max: 16,
				},
				{
					type: 'number',
					label: 'Control Number (nn)',
					id: 'controlNumber',
					default: 1,
					min: 0,
					max: 127,
				},
				{
					type: 'number',
					label: 'Value (vv)',
					id: 'value',
					default: 0,
					min: 0,
					max: 127,
				},
			],
			callback: async (action) => {
				self.sendAction('ufx_unit_parameter', action.options)
			},
		},
		ufx_unit_key: {
			name: 'Set UFX Unit Key Parameter',
			options: [
				{
					type: 'number',
					label: 'UFX MIDI Channel (M)',
					id: 'midiChannel',
					default: 1,
					min: 1,
					max: 16,
				},
				{
					type: 'number',
					label: 'Control Number (nn)',
					id: 'controlNumber',
					default: 1,
					min: 0,
					max: 127,
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: 'C',
					choices: [
						{ label: 'C', id: 'C' },
						{ label: 'C#', id: 'C#' },
						{ label: 'D', id: 'D' },
						{ label: 'D#', id: 'D#' },
						{ label: 'E', id: 'E' },
						{ label: 'F', id: 'F' },
						{ label: 'F#', id: 'F#' },
						{ label: 'G', id: 'G' },
						{ label: 'G#', id: 'G#' },
						{ label: 'A', id: 'A' },
						{ label: 'A#', id: 'A#' },
						{ label: 'B', id: 'B' },
					],
				},
			],
			callback: async (action) => {
				self.sendAction('ufx_unit_key', action.options)
			},
		},
		ufx_unit_scale: {
			name: 'Set UFX Unit Scale Parameter',
			options: [
				{
					type: 'number',
					label: 'UFX MIDI Channel (M)',
					id: 'midiChannel',
					default: 1,
					min: 1,
					max: 16,
				},
				{
					type: 'number',
					label: 'Control Number (nn)',
					id: 'controlNumber',
					default: 1,
					min: 0,
					max: 127,
				},
				{
					type: 'dropdown',
					label: 'Scale',
					id: 'scale',
					default: 'Major',
					choices: [
						{ label: 'Major', id: 'Major' },
						{ label: 'Minor', id: 'Minor' },
						{ label: 'Chromatic', id: 'Chromatic' },
					],
				},
			],
			callback: async (action) => {
				self.sendAction('ufx_unit_scale', action.options)
			},
		},
		input_to_main: {
			name: 'Input to Main Assign',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'strip',
					default: 0,
					choices: INPUT_CHANNEL_CHOICES,
					minChoicesForSearch: 0,
				},
				{
					type: 'checkbox',
					label: 'Assign to Main',
					id: 'assign',
					default: true,
				},
			],
			callback: async (action) => {
				self.sendAction('input_to_main', action.options)
			},
		},
	})
}
