import { CompanionActionEvent } from '@companion-module/base'
import { z } from 'zod'

import {
	CHANNEL_COLOURS,
	CHANNEL_TYPES,
	CUE_LIST_COUNT,
	DCA_COUNT,
	EQ_MAXIMUM_FREQUENCY,
	EQ_MAXIMUM_GAIN,
	EQ_MAXIMUM_WIDTH,
	EQ_MINIMUM_FREQUENCY,
	EQ_MINIMUM_GAIN,
	EQ_MINIMUM_WIDTH,
	EQ_TYPES,
	FX_RETURN_COUNT,
	HPF_MAXIMUM_FREQUENCY,
	HPF_MINIMUM_FREQUENCY,
	INPUT_CHANNEL_COUNT,
	MAIN_COUNT,
	MIXRACK_DX_SOCKET_COUNT,
	MIXRACK_SOCKET_COUNT,
	MONO_AUX_COUNT,
	MONO_FX_SEND_COUNT,
	MONO_GROUP_COUNT,
	MONO_MATRIX_COUNT,
	MUTE_GROUP_COUNT,
	PREAMP_MAXIMUM_GAIN,
	PREAMP_MINIMUM_GAIN,
	SCENE_COUNT,
	SOCKET_TYPES,
	STEREO_AUX_COUNT,
	STEREO_FX_SEND_COUNT,
	STEREO_GROUP_COUNT,
	STEREO_MATRIX_COUNT,
	STEREO_UFX_RETURN_COUNT,
	STEREO_UFX_SEND_COUNT,
	UFX_KEY_CHOICES,
	UFX_SCALE_CHOICES,
} from '../constants.js'

/**
 * Type helper that prepends a prefix to each key of a Zod shape using camel case
 */
type PrefixedShape<S extends z.ZodRawShape, P extends string> = {
	[K in keyof S as P extends '' ? K : `${P}${Capitalize<string & K>}`]: S[K]
}

export const prefixShape = <S extends z.ZodRawShape, P extends string>(shape: S, prefix: P): PrefixedShape<S, P> =>
	Object.fromEntries(
		Object.entries(shape).map(([k, v]) => [prefix ? prefix + k.charAt(0).toUpperCase() + k.slice(1) : k, v]),
	) as PrefixedShape<S, P>

const channelOptions = {
	channelType: z.enum(CHANNEL_TYPES),
	input: z
		.number()
		.int()
		.min(0)
		.max(INPUT_CHANNEL_COUNT - 1),
	monoGroup: z
		.number()
		.int()
		.min(0)
		.max(MONO_GROUP_COUNT - 1),
	stereoGroup: z
		.number()
		.int()
		.min(0)
		.max(STEREO_GROUP_COUNT - 1),
	monoAux: z
		.number()
		.int()
		.min(0)
		.max(MONO_AUX_COUNT - 1),
	stereoAux: z
		.number()
		.int()
		.min(0)
		.max(STEREO_AUX_COUNT - 1),
	monoMatrix: z
		.number()
		.int()
		.min(0)
		.max(MONO_MATRIX_COUNT - 1),
	stereoMatrix: z
		.number()
		.int()
		.min(0)
		.max(STEREO_MATRIX_COUNT - 1),
	monoFxSend: z
		.number()
		.int()
		.min(0)
		.max(MONO_FX_SEND_COUNT - 1),
	stereoFxSend: z
		.number()
		.int()
		.min(0)
		.max(STEREO_FX_SEND_COUNT - 1),
	fxReturn: z
		.number()
		.int()
		.min(0)
		.max(FX_RETURN_COUNT - 1),
	main: z
		.number()
		.int()
		.min(0)
		.max(MAIN_COUNT - 1),
	dca: z
		.number()
		.int()
		.min(0)
		.max(DCA_COUNT - 1),
	muteGroup: z
		.number()
		.int()
		.min(0)
		.max(MUTE_GROUP_COUNT - 1),
	stereoUfxSend: z
		.number()
		.int()
		.min(0)
		.max(STEREO_UFX_SEND_COUNT - 1),
	stereoUfxReturn: z
		.number()
		.int()
		.min(0)
		.max(STEREO_UFX_RETURN_COUNT - 1),
} as const

const socketOptions = {
	socketType: z.enum(SOCKET_TYPES),
	mixrackSockets1To64: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_SOCKET_COUNT - 1),
	mixrackDx1To2: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_DX_SOCKET_COUNT - 1),
	mixrackDx3To4: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_DX_SOCKET_COUNT - 1),
} as const

const MuteActionSchema = z.object({
	options: z.object({
		...channelOptions,
		mute: z.boolean(),
	}),
})

const FaderLevelActionSchema = z.object({
	options: z.object({
		...channelOptions,
		level: z.number().int().min(0).max(128),
	}),
})

const AssignChannelToMainMixActionSchema = z.object({
	options: z.object({
		...channelOptions,
		assign: z.boolean(),
	}),
})

const AuxFXMatrixSendLevelActionSchema = z.object({
	options: z.object({
		...channelOptions,
		...prefixShape(channelOptions, 'destination'),
		level: z.number().int().min(0).max(128),
	}),
})

const InputToGroupAuxOnActionSchema = z.object({
	options: z.object({
		...prefixShape(channelOptions, 'destination'),
		level: z.number().int().min(0).max(128),
		input: z
			.number()
			.int()
			.min(0)
			.max(INPUT_CHANNEL_COUNT - 1),
	}),
})

const DcaAssignActionSchema = z.object({
	options: z.object({
		...channelOptions,
		destinationDca: z
			.number()
			.int()
			.min(0)
			.max(DCA_COUNT - 1),
		assign: z.boolean(),
	}),
})

const MuteGroupAssignActionSchema = z.object({
	options: z.object({
		...channelOptions,
		destinationMuteGroup: z
			.number()
			.int()
			.min(0)
			.max(MUTE_GROUP_COUNT - 1),
		assign: z.boolean(),
	}),
})

const SetSocketPreampGainActionSchema = z.object({
	options: z.object({
		...socketOptions,
		gain: z.number().min(PREAMP_MINIMUM_GAIN).max(PREAMP_MAXIMUM_GAIN),
	}),
})

const SetSocketPreampPadActionSchema = z.object({
	options: z.object({
		...socketOptions,
		pad: z.boolean(),
	}),
})

const SetSocketPreamp48vActionSchema = z.object({
	options: z.object({
		...socketOptions,
		phantom: z.boolean(),
	}),
})

const SetChannelNameActionSchema = z.object({
	options: z.object({
		...channelOptions,
		name: z.string(),
	}),
})

const SetChannelColourActionSchema = z.object({
	options: z.object({
		...channelOptions,
		colour: z
			.number()
			.int()
			.min(0)
			.max(CHANNEL_COLOURS.length - 1),
	}),
})

const RecallSceneActionSchema = z.object({
	options: z.object({
		scene: z
			.number()
			.int()
			.min(0)
			.max(SCENE_COUNT - 1),
	}),
})

const RecallCueListActionSchema = z.object({
	options: z.object({
		recallId: z
			.number()
			.int()
			.min(0)
			.max(CUE_LIST_COUNT - 1),
	}),
})

const GoNextPreviousActionSchema = z.object({
	options: z.object({
		controlNumber: z.number().int().min(0).max(127),
		controlValue: z.number().int().min(0).max(127),
	}),
})

const ParametricEqActionSchema = z.object({
	options: z.object({
		...channelOptions,
		band: z.number().int().min(0).max(3),
		type: z.enum(EQ_TYPES),
		frequency: z.number().min(EQ_MINIMUM_FREQUENCY).max(EQ_MAXIMUM_FREQUENCY),
		gain: z.number().min(EQ_MINIMUM_GAIN).max(EQ_MAXIMUM_GAIN),
		width: z.number().min(EQ_MINIMUM_WIDTH).max(EQ_MAXIMUM_WIDTH),
	}),
})

const HpfFrequencyActionSchema = z.object({
	options: z.object({
		input: z
			.number()
			.int()
			.min(0)
			.max(INPUT_CHANNEL_COUNT - 1),
		frequency: z.number().min(HPF_MINIMUM_FREQUENCY).max(HPF_MAXIMUM_FREQUENCY),
	}),
})

const SetHpfOnOffActionSchema = z.object({
	options: z.object({
		input: z
			.number()
			.int()
			.min(0)
			.max(INPUT_CHANNEL_COUNT - 1),
		hpf: z.boolean(),
	}),
})

const SetUfxGlobalKeyActionSchema = z.object({
	options: z.object({
		key: z
			.number()
			.int()
			.min(0)
			.max(UFX_KEY_CHOICES.length - 1),
	}),
})

const SetUfxGlobalScaleActionSchema = z.object({
	options: z.object({
		scale: z
			.number()
			.int()
			.min(0)
			.max(UFX_SCALE_CHOICES.length - 1),
	}),
})

const SetUfxUnitParameterActionSchema = z.object({
	options: z.object({
		midiChannel: z.number().int().min(1).max(16),
		controlNumber: z.number().int().min(0).max(127),
		controlValue: z.number().int().min(0).max(127),
	}),
})

const DliveModuleConfigSchema = z.object({
	host: z.string(),
	midiChannel: z.number().int().min(0).max(16),
	midiPort: z.number().int().min(0).max(65535),
})

type MuteAction = z.infer<typeof MuteActionSchema>

type FaderLevelAction = z.infer<typeof FaderLevelActionSchema>

type AssignChannelToMainMixAction = z.infer<typeof AssignChannelToMainMixActionSchema>

type AuxFXMatrixSendLevelAction = z.infer<typeof AuxFXMatrixSendLevelActionSchema>

type InputToGroupAuxOnAction = z.infer<typeof InputToGroupAuxOnActionSchema>

type DcaAssignAction = z.infer<typeof DcaAssignActionSchema>

type MuteGroupAssignAction = z.infer<typeof MuteGroupAssignActionSchema>

type SetSocketPreampGainAction = z.infer<typeof SetSocketPreampGainActionSchema>

type SetSocketPreampPadAction = z.infer<typeof SetSocketPreampPadActionSchema>

type SetSocketPreamp48vAction = z.infer<typeof SetSocketPreamp48vActionSchema>

type SetChannelNameAction = z.infer<typeof SetChannelNameActionSchema>

type SetChannelColourAction = z.infer<typeof SetChannelColourActionSchema>

type RecallSceneAction = z.infer<typeof RecallSceneActionSchema>

type RecallCueListAction = z.infer<typeof RecallCueListActionSchema>

type GoNextPreviousAction = z.infer<typeof GoNextPreviousActionSchema>

type ParametricEqAction = z.infer<typeof ParametricEqActionSchema>

type HpfFrequencyAction = z.infer<typeof HpfFrequencyActionSchema>

type SetHpfOnOffAction = z.infer<typeof SetHpfOnOffActionSchema>

type SetUfxGlobalKeyAction = z.infer<typeof SetUfxGlobalKeyActionSchema>

type SetUfxGlobalScaleAction = z.infer<typeof SetUfxGlobalScaleActionSchema>

type SetUfxUnitParameterAction = z.infer<typeof SetUfxUnitParameterActionSchema>

export const parseMuteAction = (action: CompanionActionEvent): MuteAction => MuteActionSchema.parse(action)

export const parseFaderLevelAction = (action: CompanionActionEvent): FaderLevelAction =>
	FaderLevelActionSchema.parse(action)

export const parseAssignChannelToMainMixAction = (action: CompanionActionEvent): AssignChannelToMainMixAction =>
	AssignChannelToMainMixActionSchema.parse(action)

export const parseAuxFxMatrixSendLevelAction = (action: CompanionActionEvent): AuxFXMatrixSendLevelAction =>
	AuxFXMatrixSendLevelActionSchema.parse(action)

export const parseInputToGroupAuxOnAction = (action: CompanionActionEvent): InputToGroupAuxOnAction =>
	InputToGroupAuxOnActionSchema.parse(action)

export const parseDcaAssignAction = (action: CompanionActionEvent): DcaAssignAction =>
	DcaAssignActionSchema.parse(action)

export const parseMuteGroupAssignAction = (action: CompanionActionEvent): MuteGroupAssignAction =>
	MuteGroupAssignActionSchema.parse(action)

export const parseSetSocketPreampGainAction = (action: CompanionActionEvent): SetSocketPreampGainAction =>
	SetSocketPreampGainActionSchema.parse(action)

export const parseSetSocketPreampPadAction = (action: CompanionActionEvent): SetSocketPreampPadAction =>
	SetSocketPreampPadActionSchema.parse(action)

export const parseSetSocketPreamp48vAction = (action: CompanionActionEvent): SetSocketPreamp48vAction =>
	SetSocketPreamp48vActionSchema.parse(action)

export const parseSetChannelNameAction = (action: CompanionActionEvent): SetChannelNameAction =>
	SetChannelNameActionSchema.parse(action)

export const parseSetChannelColourAction = (action: CompanionActionEvent): SetChannelColourAction =>
	SetChannelColourActionSchema.parse(action)

export const parseRecallSceneAction = (action: CompanionActionEvent): RecallSceneAction =>
	RecallSceneActionSchema.parse(action)

export const parseRecallCueListAction = (action: CompanionActionEvent): RecallCueListAction =>
	RecallCueListActionSchema.parse(action)

export const parseGoNextPreviousAction = (action: CompanionActionEvent): GoNextPreviousAction =>
	GoNextPreviousActionSchema.parse(action)

export const parseParametricEqAction = (action: CompanionActionEvent): ParametricEqAction =>
	ParametricEqActionSchema.parse(action)

export const parseHpfFrequencyAction = (action: CompanionActionEvent): HpfFrequencyAction =>
	HpfFrequencyActionSchema.parse(action)

export const parseSetHpfOnOffAction = (action: CompanionActionEvent): SetHpfOnOffAction =>
	SetHpfOnOffActionSchema.parse(action)

export const parseSetUfxGlobalKeyAction = (action: CompanionActionEvent): SetUfxGlobalKeyAction =>
	SetUfxGlobalKeyActionSchema.parse(action)

export const parseSetUfxGlobalScaleAction = (action: CompanionActionEvent): SetUfxGlobalScaleAction =>
	SetUfxGlobalScaleActionSchema.parse(action)

export const parseSetUfxUnitParameterAction = (action: CompanionActionEvent): SetUfxUnitParameterAction =>
	SetUfxUnitParameterActionSchema.parse(action)

export const parseDliveModuleConfig = (config: Record<string, unknown>): DLiveModuleConfig =>
	DliveModuleConfigSchema.parse(config)
