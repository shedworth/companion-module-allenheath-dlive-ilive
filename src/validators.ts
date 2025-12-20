import { CompanionActionEvent } from '@companion-module/base'
import { z } from 'zod'
import {
	CHANNEL_TYPES,
	DCA_COUNT,
	FX_RETURN_COUNT,
	INPUT_CHANNEL_COUNT,
	MAIN_COUNT,
	MONO_AUX_COUNT,
	MONO_FX_SEND_COUNT,
	MONO_GROUP_COUNT,
	MONO_MATRIX_COUNT,
	MUTE_GROUP_COUNT,
	SOCKET_PREAMP_COUNT,
	STEREO_AUX_COUNT,
	STEREO_FX_SEND_COUNT,
	STEREO_GROUP_COUNT,
	STEREO_MATRIX_COUNT,
	STEREO_UFX_RETURN_COUNT,
	STEREO_UFX_SEND_COUNT,
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

type PrefixedShape<S extends z.ZodRawShape, P extends string> = {
	[K in keyof S as `${P}_${string & K}`]: S[K]
}

function prefixShape<S extends z.ZodRawShape, P extends string>(shape: S, prefix: P): PrefixedShape<S, P> {
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

const SetChannelNameActionSchema = z.object({
	options: ChannelOptionsSchema.extend({
		name: z.string(),
	}).transform(camelCaseKeysSafe),
})

const TogglePhantomActionSchema = z.object({
	options: z.object({
		phantom: z.boolean(),
		preamp: z
			.number()
			.int()
			.min(0)
			.max(SOCKET_PREAMP_COUNT - 1),
	}),
})

type MuteAction = z.infer<typeof MuteActionSchema>

type FaderLevelAction = z.infer<typeof FaderLevelActionSchema>

type AssignChannelToMainMixAction = z.infer<typeof AssignChannelToMainMixActionSchema>

type AuxFXMatrixSendLevelAction = z.infer<typeof AuxFXMatrixSendLevelActionSchema>

type SetChannelNameAction = z.infer<typeof SetChannelNameActionSchema>

type TogglePhantomAction = z.infer<typeof TogglePhantomActionSchema>

export const parseMuteAction = (action: CompanionActionEvent): MuteAction => MuteActionSchema.parse(action)

export const parseFaderLevelAction = (action: CompanionActionEvent): FaderLevelAction =>
	FaderLevelActionSchema.parse(action)

export const parseAssignChannelToMainMixAction = (action: CompanionActionEvent): AssignChannelToMainMixAction =>
	AssignChannelToMainMixActionSchema.parse(action)

export const parseAuxFxMatrixSendLevelAction = (action: CompanionActionEvent): AuxFXMatrixSendLevelAction =>
	AuxFXMatrixSendLevelActionSchema.parse(action)

export const parseSetChannelNameAction = (action: CompanionActionEvent): SetChannelNameAction =>
	SetChannelNameActionSchema.parse(action)

export const parseTogglePhantomAction = (action: CompanionActionEvent): TogglePhantomAction =>
	TogglePhantomActionSchema.parse(action)
