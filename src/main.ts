/**
 *
 * Companion instance class for the A&H dLive Mixer.
 * @version 2.0.0
 *
 */

import { InstanceBase, Regex, runEntrypoint, SomeCompanionConfigField, TCPHelper } from '@companion-module/base'
import { _UpdateActions } from './actions.js'
import upgradeScripts from './upgrade.js'
import { DCA_COUNT, SYSEX_HEADER } from './constants.js'
import { stringToSysExBytes } from './utils/stringToSysExBytes.js'
import { getMidiOffsetsForChannelType } from './utils/getMidiOffsetsForChannelType.js'

type DLiveModuleConfig = {
	host: string
	midiChannel: number
	midiPort: number
	tcpPort: number
}

export class ModuleInstance extends InstanceBase<DLiveModuleConfig> {
	config!: DLiveModuleConfig
	tcpSocket?: TCPHelper
	midiSocket?: TCPHelper

	constructor(internal: unknown) {
		super(internal)
	}

	async init(initialConfig: DLiveModuleConfig): Promise<void> {
		this.config = initialConfig
		await this.configUpdated(this.config || {})
	}

	async destroy(): Promise<void> {
		if (this.tcpSocket !== undefined) {
			this.tcpSocket.destroy()
		}

		if (this.midiSocket !== undefined) {
			this.midiSocket.destroy()
		}

		this.log('debug', `destroyed ${this.id}`)
	}

	async configUpdated(config: DLiveModuleConfig): Promise<void> {
		this.config = config || {
			host: '192.168.1.70',
			midiChannel: 0,
			midiPort: 51328,
			tcpPort: 51321,
		}

		// Ensure port defaults are set even if config exists
		if (!this.config.midiPort) this.config.midiPort = 51328
		if (!this.config.tcpPort) this.config.tcpPort = 51321
		if (this.config.midiChannel === undefined) this.config.midiChannel = 0

		this.updateActions()
		this.init_tcp()
	}

	updateActions(): void {
		_UpdateActions(this)
	}

	sendMidiToDlive(midiMessage: number[]): void {
		if (!this.midiSocket) {
			this.log('error', 'no midi socket')
			return
		}
		console.log('sending midi: ', midiMessage)
		this.midiSocket.send(Buffer.from(midiMessage)).catch((e) => {
			this.log('error', `MIDI send error: ${e.midiMessage}`)
		})
	}

	sendCommand({ command, params }: DLiveCommand): void {
		console.log('sendCommand: ', command, params)
		if (!this.midiSocket) {
			this.log('error', 'no midi socket')
			return
		}

		switch (command) {
			case 'mute_on': {
				const { channelNo, channelType } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([
					0x90 + midiChannelOffset,
					channelNo + midiNoteOffset,
					0x7f,
					channelNo + midiNoteOffset,
					0,
				])
				break
			}

			case 'mute_off': {
				const { channelNo, channelType } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([
					0x90 + midiChannelOffset,
					channelNo + midiNoteOffset,
					0x3f,
					channelNo + midiNoteOffset,
					0,
				])
				break
			}

			case 'fader_level': {
				const { channelNo, channelType, level } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([0xb0 + midiChannelOffset, 0x63, channelNo + midiNoteOffset, 0x62, 0x17, 0x06, level])
				break
			}

			case 'set_socket_preamp_48v': {
				const { socketNo, shouldEnable } = params
				this.sendMidiToDlive([...SYSEX_HEADER, 0, 0, 0x0c, socketNo, shouldEnable ? 0x7f : 0, 0xf7])
				break
			}

			case 'channel_assignment_to_main_mix_on': {
				const { channelNo, channelType } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([0xb0 + midiChannelOffset, 0x63, channelNo + midiNoteOffset, 0x62, 0x18, 0x06, 0x7f])
				break
			}

			case 'channel_assignment_to_main_mix_off': {
				const { channelNo, channelType } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([0xb0 + midiChannelOffset, 0x63, channelNo + midiNoteOffset, 0x62, 0x18, 0x06, 0x3f])
				break
			}
			case 'aux_fx_matrix_send_level': {
				const { channelNo, channelType, destinationChannelNo, destinationChannelType, level } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				const { midiChannelOffset: destinationMidiChannelOffset, midiNoteOffset: destinationMidiNoteOffset } =
					getMidiOffsetsForChannelType(destinationChannelType)

				console.log(params)
				this.sendMidiToDlive([
					...SYSEX_HEADER,
					0 + midiChannelOffset,
					0xd,
					channelNo + midiNoteOffset,
					destinationMidiChannelOffset,
					destinationChannelNo + destinationMidiNoteOffset,
					level,
					0xf7,
				])
				break
			}
			// case 'input_to_group_aux_on':
			// case 'dca_assignment_on':
			// case 'dca_assignment_off':
			// case 'mute_group_assignment_on':
			// case 'mute_group_assignment_off':
			// case 'set_socket_preamp_gain':
			// case 'set_socket_preamp_pad':
			case 'set_channel_name': {
				const { channelNo, channelType, name } = params
				const { midiChannelOffset, midiNoteOffset } = getMidiOffsetsForChannelType(channelType)
				this.sendMidiToDlive([
					...SYSEX_HEADER,
					0 + midiChannelOffset,
					0x03,
					channelNo + midiNoteOffset,
					...stringToSysExBytes(name),
					0xf7,
				])
				break
			}
			case 'set_channel_colour':
			case 'scene_recall':
			case 'cue_list_recall':
			case 'go_next_previous':
			case 'parametric_eq':
			case 'hpf_frequency':
			case 'hpf_on_off':
			case 'ufx_global_key':
			case 'ufx_global_scale':
			case 'ufx_parameter':
				break
		}
	}

	sendAction(actionId, options) {
		console.log({ actionId, options })
		const opt = options
		const channel = parseInt(opt.inputChannel)
		let chOfs = 0
		const strip = parseInt(opt.strip)
		let cmd = { port: this.config.midiPort, buffers: [] }

		switch (
			actionId // Note that only available actions for the type (TCP or MIDI) will be processed
		) {
			case 'mute_input':
			case 'mute_mix':
				chOfs = 0
				break

			case 'mute_mono_group':
			case 'mute_stereo_group':
				chOfs = 1
				break

			case 'mute_mono_aux':
			case 'mute_stereo_aux':
				chOfs = 2
				break

			case 'mute_mono_matrix':
			case 'mute_stereo_matrix':
				chOfs = 3
				break

			case 'mute_mono_fx_send':
			case 'mute_stereo_fx_send':
			case 'mute_fx_return':
			case 'mute_dca':
			case 'mute_master':
			case 'mute_ufx_send':
			case 'mute_ufx_return':
				chOfs = 4
				break

			case 'fader_input':
			case 'fader_mix':
				chOfs = 0
				break

			case 'fader_mono_group':
			case 'fader_stereo_group':
				chOfs = 1
				break

			case 'fader_mono_aux':
			case 'fader_stereo_aux':
				chOfs = 2
				break

			case 'fader_mono_matrix':
			case 'fader_stereo_matrix':
				chOfs = 3
				break

			case 'fader_DCA':
			case 'fader_mono_fx_send':
			case 'fader_stereo_fx_send':
			case 'fader_fx_return':
			case 'fader_ufx_send':
			case 'fader_ufx_return':
				chOfs = 4
				break

			case 'phantom':
				cmd.buffers = [
					Buffer.from([0xf0, 0, 0, 0x1a, 0x50, 0x10, 0x01, 0, 0, 0x0c, strip, opt.phantom ? 0x7f : 0, 0xf7]),
				]
				break

			case 'dca_assign':
				cmd.buffers = getRoutingCmds(channel, opt.dcaGroup, false)
				break

			case 'mute_assign':
				cmd.buffers = getRoutingCmds(channel, opt.muteGroup, true)
				break

			case 'scene_recall': {
				const sceneNumber = parseInt(opt.sceneNumber)
				cmd.buffers = [Buffer.from([0xb0, 0, (sceneNumber >> 7) & 0x0f, 0xc0, sceneNumber & 0x7f])]
				break
			}

			case 'scene_next':
				cmd.buffers = [Buffer.from([0xb0, 0x77, 0x7f])] // Control Change for Scene Next
				break

			case 'scene_previous':
				cmd.buffers = [Buffer.from([0xb0, 0x76, 0x7f])] // Control Change for Scene Previous
				break

			case 'solo_input':
				cmd.buffers = [Buffer.from([0xb0, 0x73, strip, 0xb0, 0x26, opt.solo ? 0x7f : 0x00])]
				break

			case 'eq_enable_input':
				// NRPN message for EQ Enable/Disable
				cmd.buffers = [Buffer.from([0xb0, 0x63, strip, 0xb0, 0x62, 0x01, 0xb0, 0x06, opt.enable ? 0x7f : 0x00])]
				break

			case 'preamp_gain': {
				// Pitchbend message for preamp gain (14-bit value)
				const gainValue = parseInt(opt.gain)
				const lsb = gainValue & 0x7f
				const msb = (gainValue >> 7) & 0x7f
				cmd.buffers = [Buffer.from([0xe0, lsb, msb])]
				break
			}

			case 'preamp_pad':
				cmd.buffers = [Buffer.from([0xf0, 0, 0, 0x1a, 0x50, 0x10, 0x01, 0, 0, 0x0d, strip, opt.pad ? 0x7f : 0, 0xf7])]
				break

			case 'hpf_control':
				// NRPN message for HPF control
				cmd.buffers = [Buffer.from([0xb0, 0x63, strip, 0xb0, 0x62, 0x02, 0xb0, 0x06, parseInt(opt.frequency)])]
				break

			case 'input_to_main':
				// NRPN message for Input to Main assignment
				cmd.buffers = [Buffer.from([0xb0, 0x63, strip, 0xb0, 0x62, 0x03, 0xb0, 0x06, opt.assign ? 0x7f : 0x00])]
				break

			case 'send_aux_mono':
			case 'send_aux_stereo':
			case 'send_fx_mono':
			case 'send_fx_stereo':
			case 'send_matrix_mono':
			case 'send_matrix_stereo':
			case 'send_mix':
			case 'send_fx':
			case 'send_ufx': {
				// SysEx messages for send levels
				const inputCh = parseInt(opt.inputChannel)
				const sendCh = parseInt(opt.send)
				const sendLevel = parseInt(opt.level)
				let sendType = 0x01 // Default for aux sends

				if (actionId.includes('fx') && !actionId.includes('ufx')) {
					sendType = 0x02 // FX sends
				} else if (actionId.includes('matrix')) {
					sendType = 0x03 // Matrix sends
				} else if (actionId.includes('ufx')) {
					sendType = 0x04 // UFX sends
				}

				cmd.buffers = [
					Buffer.from([0xf0, 0, 0, 0x1a, 0x50, 0x10, 0x01, 0, 0, sendType, inputCh, sendCh, sendLevel, 0xf7]),
				]
				break
			}

			case 'ufx_global_key':
				// Control Change message for UFX Global Key (BN, 0C, Key)
				cmd.buffers = [Buffer.from([0xb0 + (this.config.midiChannel || 0), 0x0c, parseInt(opt.key)])]
				break

			case 'ufx_global_scale':
				// Control Change message for UFX Global Scale (BN, 0D, Scale)
				cmd.buffers = [Buffer.from([0xb0 + (this.config.midiChannel || 0), 0x0d, parseInt(opt.scale)])]
				break

			case 'ufx_unit_parameter': {
				// Control Change message for UFX Unit Parameter (BM, nn, vv)
				const midiCh = parseInt(opt.midiChannel) - 1 // Convert to 0-based
				cmd.buffers = [Buffer.from([0xb0 + midiCh, parseInt(opt.controlNumber), parseInt(opt.value)])]
				break
			}

			case 'ufx_unit_key': {
				// Control Change message for UFX Unit Key Parameter with CC value scaling
				const keyMidiCh = parseInt(opt.midiChannel) - 1 // Convert to 0-based
				const controlNum = parseInt(opt.controlNumber)

				// Map key to CC value range (refer to protocol table)
				const keyMapping = {
					C: 5, // Mid-range value for C (0-10 range)
					'C#': 16, // Mid-range value for C# (11-21 range)
					D: 26, // Mid-range value for D (22-31 range)
					'D#': 37, // Mid-range value for D# (32-42 range)
					E: 47, // Mid-range value for E (43-52 range)
					F: 58, // Mid-range value for F (53-63 range)
					'F#': 69, // Mid-range value for F# (64-74 range)
					G: 79, // Mid-range value for G (75-84 range)
					'G#': 90, // Mid-range value for G# (85-95 range)
					A: 100, // Mid-range value for A (96-105 range)
					'A#': 111, // Mid-range value for A# (106-116 range)
					B: 122, // Mid-range value for B (117-127 range)
				}

				const keyValue = keyMapping[opt.key] || 5
				cmd.buffers = [Buffer.from([0xb0 + keyMidiCh, controlNum, keyValue])]
				break
			}

			case 'ufx_unit_scale': {
				// Control Change message for UFX Unit Scale Parameter with CC value scaling
				const scaleMidiCh = parseInt(opt.midiChannel) - 1 // Convert to 0-based
				const scaleControlNum = parseInt(opt.controlNumber)

				// Map scale to CC value range (refer to protocol table)
				const scaleMapping = {
					Major: 21, // Mid-range value for Major (0-42 range)
					Minor: 63, // Mid-range value for Minor (43-84 range)
					Chromatic: 106, // Mid-range value for Chromatic (85-127 range)
				}

				const scaleValue = scaleMapping[opt.scale] || 21
				cmd.buffers = [Buffer.from([0xb0 + scaleMidiCh, scaleControlNum, scaleValue])]
				break
			}

			case 'talkback_on':
				cmd = {
					port: this.config.tcpPort,
					buffers: [Buffer.from([0xf0, 0, 2, 0, 0x4b, 0, 0x4a, 0x10, 0xe7, 0, 1, opt.on ? 1 : 0, 0xf7])],
				}
				break

			case 'vsc':
				cmd = {
					port: this.config.tcpPort,
					buffers: [Buffer.from([0xf0, 0, 2, 0, 0x4b, 0, 0x4a, 0x10, 0x8a, 0, 1, opt.vscMode, 0xf7])],
				}
		}

		if (cmd.buffers.length == 0) {
			// Mute or Fader Level actions
			if (actionId.slice(0, 4) == 'mute') {
				cmd.buffers = [Buffer.from([0x90 + chOfs, strip, opt.mute ? 0x7f : 0x3f, 0x90 + chOfs, strip, 0])]
			} else {
				const faderLevel = parseInt(opt.level)
				cmd.buffers = [Buffer.from([0xb0 + chOfs, 0x63, strip, 0x62, 0x17, 0x06, faderLevel])]
			}
		}

		for (let i = 0; i < cmd.buffers.length; i++) {
			if (cmd.port === this.config.midiPort && this.midiSocket !== undefined) {
				this.log(
					'debug',
					`sending ${cmd.buffers[i].toString('hex')} via MIDI @${this.config.host}:${this.config.midiPort}`,
				)
				this.midiSocket.send(cmd.buffers[i]).catch((e) => {
					this.log('error', `MIDI send error: ${e.message}`)
				})
			} else if (this.tcpSocket !== undefined) {
				this.log(
					'debug',
					`sending ${cmd.buffers[i].toString('hex')} via TCP @${this.config.host}:${this.config.tcpPort}`,
				)
				this.tcpSocket.send(cmd.buffers[i]).catch((e) => {
					this.log('error', `TCP send error: ${e.message}`)
				})
			}
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the Allen & Heath dLive mixer',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				default: '192.168.1.70',
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'midiPort',
				label: 'MIDI Port',
				width: 6,
				default: 51328,
				min: 1,
				max: 65535,
			},
			{
				type: 'number',
				id: 'tcpPort',
				label: 'TCP Port',
				width: 6,
				default: 51321,
				min: 1,
				max: 65535,
			},
			{
				type: 'number',
				id: 'midiChannel',
				label: 'MIDI Channel for dLive System (N)',
				width: 6,
				default: 0,
				min: 0,
				max: 15,
			},
		]
	}

	init_tcp(): void {
		if (this.tcpSocket !== undefined) {
			this.tcpSocket.destroy()
			delete this.tcpSocket
		}

		if (this.midiSocket !== undefined) {
			this.midiSocket.destroy()
			delete this.midiSocket
		}

		if (this.config.host) {
			this.midiSocket = new TCPHelper(this.config.host, this.config.midiPort)

			this.midiSocket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.midiSocket.on('error', (err) => {
				this.log('error', 'MIDI error: ' + err.message)
			})

			this.midiSocket.on('connect', () => {
				this.log('debug', `MIDI Connected to ${this.config.host}`)
			})

			this.tcpSocket = new TCPHelper(this.config.host, this.config.tcpPort)

			this.tcpSocket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.tcpSocket.on('error', (err) => {
				this.log('error', 'TCP error: ' + err.message)
			})

			this.tcpSocket.on('connect', () => {
				this.log('debug', `TCP Connected to ${this.config.host}`)
			})
		}
	}
}

const getRoutingCmds = (ch: number, selArray: string, isMute: boolean): Buffer[] => {
	const routingCmds: Buffer[] = []
	const start = isMute ? DCA_COUNT : 0
	const qty = isMute ? 8 : DCA_COUNT
	const chOfs = 0
	for (let i = start; i < start + qty; i++) {
		const grpCode = i + (selArray.includes(`${i - start}`) ? 0x40 : 0)
		routingCmds.push(Buffer.from([0xb0, 0x63, ch + chOfs, 0xb0, 0x62, 0x40, 0xb0, 0x06, grpCode]))
	}

	return routingCmds
}

runEntrypoint(ModuleInstance, upgradeScripts)
