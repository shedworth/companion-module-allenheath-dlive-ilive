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
} from './constants.js'
import { camelCase, fromPairs, map, pipe, toPairs } from 'lodash/fp'

const channelOptionsShape = {
	channel_type: z.enum(CHANNEL_TYPES),
	input: z
		.number()
		.int()
		.min(0)
		.max(INPUT_CHANNEL_COUNT - 1),
	mono_group: z
		.number()
		.int()
		.min(0)
		.max(MONO_GROUP_COUNT - 1),
	stereo_group: z
		.number()
		.int()
		.min(0)
		.max(STEREO_GROUP_COUNT - 1),
	mono_aux: z
		.number()
		.int()
		.min(0)
		.max(MONO_AUX_COUNT - 1),
	stereo_aux: z
		.number()
		.int()
		.min(0)
		.max(STEREO_AUX_COUNT - 1),
	mono_matrix: z
		.number()
		.int()
		.min(0)
		.max(MONO_MATRIX_COUNT - 1),
	stereo_matrix: z
		.number()
		.int()
		.min(0)
		.max(STEREO_MATRIX_COUNT - 1),
	mono_fx_send: z
		.number()
		.int()
		.min(0)
		.max(MONO_FX_SEND_COUNT - 1),
	stereo_fx_send: z
		.number()
		.int()
		.min(0)
		.max(STEREO_FX_SEND_COUNT - 1),
	fx_return: z
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
	mute_group: z
		.number()
		.int()
		.min(0)
		.max(MUTE_GROUP_COUNT - 1),
	stereo_ufx_send: z
		.number()
		.int()
		.min(0)
		.max(STEREO_UFX_SEND_COUNT - 1),
	stereo_ufx_return: z
		.number()
		.int()
		.min(0)
		.max(STEREO_UFX_RETURN_COUNT - 1),
} as const

const socketOptionsShape = {
	socket_type: z.enum(SOCKET_TYPES),
	mixrack_sockets_1_64: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_SOCKET_COUNT - 1),
	mixrack_dx_1_2: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_DX_SOCKET_COUNT - 1),
	mixrack_dx_3_4: z
		.number()
		.int()
		.min(0)
		.max(MIXRACK_DX_SOCKET_COUNT - 1),
} as const

type PrefixedShape<S extends z.ZodRawShape, P extends string> = {
	[K in keyof S as `${P}_${string & K}`]: S[K]
}

const prefixShape = <S extends z.ZodRawShape, P extends string>(shape: S, prefix: P): PrefixedShape<S, P> => {
	const out: any = {}
	for (const [k, v] of Object.entries(shape)) {
		const key = `${prefix ? prefix + '_' : ''}${k.charAt(0)}${k.slice(1)}`
		out[key] = v
	}
	return out
}

const camelCaseKeys = pipe(toPairs, (pairs) => map(([key, value]) => [camelCase(key), value])(pairs), fromPairs)

const camelCaseKeysSafe = <T extends Record<string, any>>(value: T): CamelizeKeys<T> =>
	camelCaseKeys(value) as CamelizeKeys<T>

const ChannelOptionsSchema = z.object(channelOptionsShape)

const MuteActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		mute: z.boolean(),
	}).transform(camelCaseKeysSafe),
})

const FaderLevelActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		level: z.number().int().min(0).max(128),
	}).transform(camelCaseKeysSafe),
})

const AssignChannelToMainMixActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		assign: z.boolean(),
	}).transform(camelCaseKeysSafe),
})

const AuxFXMatrixSendLevelActionSchema = z.object({
	options: z
		.object({
			...channelOptionsShape,
			...prefixShape(channelOptionsShape, 'destination'),
			level: z.number().int().min(0).max(128),
		})
		.transform(camelCaseKeysSafe),
})

const InputToGroupAuxOnActionSchema = z.object({
	options: z
		.object({
			...prefixShape(channelOptionsShape, 'destination'),
			level: z.number().int().min(0).max(128),
			input: z
				.number()
				.int()
				.min(0)
				.max(INPUT_CHANNEL_COUNT - 1),
		})
		.transform(camelCaseKeysSafe),
})

const DcaAssignActionSchema = z.object({
	options: z
		.object({
			...channelOptionsShape,
			destinationDca: z
				.number()
				.int()
				.min(0)
				.max(DCA_COUNT - 1),
			assign: z.boolean(),
		})
		.transform(camelCaseKeysSafe),
})

const MuteGroupAssignActionSchema = z.object({
	options: z
		.object({
			...channelOptionsShape,
			destinationMuteGroup: z
				.number()
				.int()
				.min(0)
				.max(MUTE_GROUP_COUNT - 1),
			assign: z.boolean(),
		})
		.transform(camelCaseKeysSafe),
})

const SetSocketPreampGainActionSchema = z.object({
	options: z
		.object({
			...socketOptionsShape,
			gain: z.number().min(PREAMP_MINIMUM_GAIN).max(PREAMP_MAXIMUM_GAIN),
		})
		.transform(camelCaseKeysSafe),
})

const SetSocketPreampPadActionSchema = z.object({
	options: z
		.object({
			...socketOptionsShape,
			pad: z.boolean(),
		})
		.transform(camelCaseKeysSafe),
})

const SetSocketPreamp48vActionSchema = z.object({
	options: z
		.object({
			...socketOptionsShape,
			phantom: z.boolean(),
		})
		.transform(camelCaseKeysSafe),
})

const SetChannelNameActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		name: z.string(),
	}).transform(camelCaseKeysSafe),
})

const SetChannelColourActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		colour: z
			.number()
			.int()
			.min(0)
			.max(CHANNEL_COLOURS.length - 1),
	}).transform(camelCaseKeysSafe),
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
	options: ChannelOptionsSchema.extend({
		band: z.number().int().min(0).max(3),
		type: z.enum(EQ_TYPES),
		frequency: z.number().min(EQ_MINIMUM_FREQUENCY).max(EQ_MAXIMUM_FREQUENCY),
		gain: z.number().min(EQ_MINIMUM_GAIN).max(EQ_MAXIMUM_GAIN),
		width: z.number().min(EQ_MINIMUM_WIDTH).max(EQ_MAXIMUM_WIDTH),
	}).transform(camelCaseKeysSafe),
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
	options: z
		.object({
			input: z
				.number()
				.int()
				.min(0)
				.max(INPUT_CHANNEL_COUNT - 1),
			hpf: z.boolean(),
		})
		.transform(camelCaseKeysSafe),
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
