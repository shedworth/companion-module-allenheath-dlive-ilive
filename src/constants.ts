import { DropdownChoice } from '@companion-module/base'
import { times } from 'lodash/fp'

export const CHANNEL_TYPES = [
	'input',
	'mono_group',
	'stereo_group',
	'mono_aux',
	'stereo_aux',
	'mono_matrix',
	'stereo_matrix',
	'mono_fx_send',
	'stereo_fx_send',
	'fx_return',
	'main',
	'mute_group',
	'stereo_ufx_send',
	'stereo_ufx_return',
	'dca',
] as const

export type ChannelType = (typeof CHANNEL_TYPES)[number]

export const INPUT_CHANNEL_COUNT = 128
export const MONO_GROUP_COUNT = 62
export const STEREO_GROUP_COUNT = 31
export const MONO_AUX_COUNT = 62
export const STEREO_AUX_COUNT = 32
export const MONO_MATRIX_COUNT = 62
export const STEREO_MATRIX_COUNT = 31
export const MONO_FX_SEND_COUNT = 16
export const STEREO_FX_SEND_COUNT = 16
export const FX_RETURN_COUNT = 16
export const MAIN_COUNT = 6
export const STEREO_UFX_SEND_COUNT = 8
export const STEREO_UFX_RETURN_COUNT = 8

export const DCA_COUNT = 24
export const MUTE_GROUP_COUNT = 8

export const SCENE_COUNT = 500

export const FADER_STEP_COUNT = 128
export const GAIN_STEP_COUNT = 128
export const SOCKET_PREAMP_COUNT = 128

export const CHANNEL_MIDI_CHANNEL_OFFSETS: Record<ChannelType, number> = {
	input: 0,
	mono_group: 1,
	stereo_group: 1,
	mono_aux: 2,
	stereo_aux: 2,
	mono_matrix: 3,
	stereo_matrix: 3,
	mono_fx_send: 4,
	stereo_fx_send: 4,
	fx_return: 4,
	main: 4,
	dca: 4,
	mute_group: 4,
	stereo_ufx_send: 4,
	stereo_ufx_return: 4,
}

export const CHANNEL_MIDI_NOTE_OFFSETS: Record<ChannelType, number> = {
	input: 0,
	mono_group: 0,
	stereo_group: 0x40,
	mono_aux: 0,
	stereo_aux: 0x40,
	mono_matrix: 0,
	stereo_matrix: 0x40,
	mono_fx_send: 0,
	stereo_fx_send: 0x10,
	fx_return: 0x20,
	main: 0x30,
	dca: 0x36,
	mute_group: 0x4e,
	stereo_ufx_send: 0x56,
	stereo_ufx_return: 0x5e,
}

export const SYSEX_HEADER = [0xf0, 0, 0, 0x1a, 0x50, 0x10, 0x01, 0x00]

export const CHANNEL_TYPE_CHOICES: { label: string; id: ChannelType }[] = [
	{ label: 'Input', id: 'input' },
	{ label: 'Mono Group', id: 'mono_group' },
	{ label: 'Stereo Group', id: 'stereo_group' },
	{ label: 'Mono Aux', id: 'mono_aux' },
	{ label: 'Stereo Aux', id: 'stereo_aux' },
	{ label: 'Mono Matrix', id: 'mono_matrix' },
	{ label: 'Stereo Matrix', id: 'stereo_matrix' },
	{ label: 'Mono FX Send', id: 'mono_fx_send' },
	{ label: 'Stereo FX Send', id: 'stereo_fx_send' },
	{ label: 'FX Return', id: 'fx_return' },
	{ label: 'Main', id: 'main' },
	{ label: 'DCA', id: 'dca' },
	{ label: 'Mute Group', id: 'mute_group' },
	{ label: 'Stereo UFX Send', id: 'stereo_ufx_send' },
	{ label: 'Stereo UFX Return', id: 'stereo_ufx_return' },
]

export const INPUT_CHANNEL_CHOICES: DropdownChoice[] = times((id: number) => ({ label: `CH ${id + 1}`, id }))(
	INPUT_CHANNEL_COUNT,
)

export const SCENE_CHOICES: DropdownChoice[] = times((id: number) => ({ label: `SCENE ${id + 1}`, id }))(SCENE_COUNT)

export const DCA_CHOICES: DropdownChoice[] = times((id: number) => ({ label: `DCA ${id + 1}`, id }))(DCA_COUNT)

export const MUTE_GROUP_CHOICES: DropdownChoice[] = times((id: number) => ({ label: `MUTE ${id + 1}`, id }))(
	MUTE_GROUP_COUNT,
)

export const FADER_LEVEL_CHOICES: DropdownChoice[] = times((id: number) => {
	const dbVal = ((id - 107) / 2).toFixed(1)
	// @ts-expect-error TODO - investigate later
	const dbStr = id == 0 ? '-INF' : dbVal == 0 ? dbVal : dbVal > 0 ? `+${dbVal}` : `-${dbVal}`
	return { label: `${dbStr} dB`, id }
})(FADER_STEP_COUNT)

// Preamp Gain Control
export const GAIN_CHOICES: DropdownChoice[] = times((id: number) => {
	const gainVal = ((id * 60) / 127 - 10).toFixed(1) // -10dB to +50dB range
	// @ts-expect-error TODO - investigate later
	const gainStr = gainVal == 0 ? '0' : gainVal > 0 ? `+${gainVal}` : gainVal
	return { label: `${gainStr} dB`, id }
})(GAIN_STEP_COUNT)

// High Pass Filter Control
export const HPF_CHOICES = [
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
export const UFX_KEY_CHOICES = [
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
export const UFX_SCALE_CHOICES = [
	{ label: 'Major', id: 0x00 },
	{ label: 'Minor', id: 0x01 },
]
