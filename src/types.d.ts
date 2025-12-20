// Type helpers
type SnakeToCamel<S extends string> = S extends `${infer H}_${infer T}` ? `${H}${Capitalize<SnakeToCamel<T>>}` : S

type CamelizeKeys<T extends Record<string, any>> = {
	[K in keyof T as SnakeToCamel<string & K>]: T[K]
}

type DLiveCommand =
	| DLiveMuteOnCommand
	| DLiveMuteOffCommand
	| DLiveFaderLevelCommand
	| DLiveChannelAssignmentToMainMixOnCommand
	| DLiveChannelAssignmentToMainMixOffCommand
	| DLiveAuxFxMatrixSendLevelCommand
	| DLiveInputToGroupAuxOnCommand
	| DLiveDcaAssignmentOnCommand
	| DLiveDcaAssignmentOffCommand
	| DLiveMuteGroupAssignmentOnCommand
	| DLiveMuteGroupAssignmentOffCommand
	| DLiveSetSocketPreampGainCommand
	| DLiveSetSocketPreampPadCommand
	| DLiveSetSocketPreamp48VCommand
	| DLiveSetChannelNameCommand
	| DLiveSetChannelColourCommand
	| DLiveSceneRecallCommand
	| DLiveCueListRecallCommand
	| DLiveGoNextPreviousCommand
	| DLiveParametricEQCommand
	| DLiveHPFFrequencyCommand
	| DLiveSetHPFOnOffCommand
	| DLiveSetUFXGlobalKeyCommand
	| DLiveSetUFXGlobalScaleCommand
	| DLiveSetUFXParameterCommand

type Colour = 'off' | 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'light_blue' | 'white'

type UFXKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

type UFXScale = 'major' | 'minor'

type ChannelNumber = number
type DCANumber = number
type MuteGroupNumber = number
type SocketNumber = number
type SceneNumber = number
type CueListRecallId = number
type MidiChannelNumber = number
type MidiControlNumber = number
type MidiValue = number

type DLiveMuteOnCommand = {
	command: 'mute_on'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
	}
}

type DLiveMuteOffCommand = {
	command: 'mute_off'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
	}
}

type DLiveFaderLevelCommand = {
	command: 'fader_level'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		level: number
	}
}

type DLiveChannelAssignmentToMainMixOnCommand = {
	command: 'channel_assignment_to_main_mix_on'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
	}
}

type DLiveChannelAssignmentToMainMixOffCommand = {
	command: 'channel_assignment_to_main_mix_off'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
	}
}

type DLiveAuxFxMatrixSendLevelCommand = {
	command: 'aux_fx_matrix_send_level'
	params: {
		channelType: Extract<ChannelType, 'input'>
		channelNo: ChannelNumber
		destinationChannelType: Extract<
			ChannelType,
			'mono_aux' | 'stereo_aux' | 'mono_fx_send' | 'stereo_fx_send' | 'mono_matrix' | 'stereo_matrix'
		>
		destinationChannelNo: ChannelNumber
		level: number
	}
}

type DLiveInputToGroupAuxOnCommand = {
	command: 'input_to_group_aux_on'
	params: {
		sourceChannelType: Extract<ChannelType, 'input'>
		sourceChannelNo: ChannelNumber
		sendChannelType: Extract<ChannelType, 'mono_aux' | 'stereo_aux' | 'mono_group' | 'stereo_group'>
		sendChannelNo: ChannelNumber
	}
}

type DLiveDcaAssignmentOnCommand = {
	command: 'dca_assignment_on'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		dcaNo: DCANumber
	}
}

type DLiveDcaAssignmentOffCommand = {
	command: 'dca_assignment_off'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		dcaNo: DCANumber
	}
}

type DLiveMuteGroupAssignmentOnCommand = {
	command: 'mute_group_assignment_on'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		muteGroupNo: MuteGroupNumber
	}
}

type DLiveMuteGroupAssignmentOffCommand = {
	command: 'mute_group_assignment_off'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		muteGroupNo: MuteGroupNumber
	}
}

type DLiveSetSocketPreampGainCommand = {
	command: 'set_socket_preamp_gain'
	params: {
		socketNo: SocketNumber
		gain: number
	}
}

type DLiveSetSocketPreampPadCommand = {
	command: 'set_socket_preamp_pad'
	params: {
		socketNo: SocketNumber
		shouldEnable: boolean
	}
}

type DLiveSetSocketPreamp48VCommand = {
	command: 'set_socket_preamp_48v'
	params: {
		socketNo: SocketNumber
		shouldEnable: boolean
	}
}

type DLiveSetChannelNameCommand = {
	command: 'set_channel_name'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		name: string
	}
}

type DLiveSetChannelColourCommand = {
	command: 'set_channel_colour'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		colour: Colour
	}
}

type DLiveSceneRecallCommand = {
	command: 'scene_recall'
	params: {
		sceneNo: SceneNumber
	}
}

type DLiveCueListRecallCommand = {
	command: 'cue_list_recall'
	params: {
		recallId: CueListRecallId
	}
}

type DLiveGoNextPreviousCommand = {
	command: 'go_next_previous'
	params: {
		action: 'go' | 'next' | 'previous'
	}
}

type DLiveParametricEQCommand = {
	command: 'parametric_eq'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		bandNo: 0 | 1 | 2 | 3
		parameter: 'type' | 'frequency' | 'width' | 'gain'
		value: number
	}
}

type DLiveHPFFrequencyCommand = {
	command: 'hpf_frequency'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		frequency: number
	}
}

type DLiveSetHPFOnOffCommand = {
	command: 'hpf_on_off'
	params: {
		channelType: ChannelType
		channelNo: ChannelNumber
		shouldEnable: boolean
	}
}

type DLiveSetUFXGlobalKeyCommand = {
	command: 'ufx_global_key'
	params: {
		key: UFXKey
	}
}

type DLiveSetUFXGlobalScaleCommand = {
	command: 'ufx_global_scale'
	params: {
		scale: UFXScale
	}
}

type DLiveSetUFXParameterCommand = {
	command: 'ufx_parameter'
	params: {
		midiChannel: MidiChannelNumber
		controlNumber: MidiControlNumber
		value: MidiValue
	}
}
