export const convertEqGainToMidiValue = (gain: number): number => Math.round(((gain + 15) * 127) / 30)

type WidthMidiPoint = { width: number; midiValue: number }

/**
EQ Width → MIDI Value Mapping
============================

| Width  | Vv (dec) | Vv (hex) |
|--------|----------|----------|
| 1.50   | 0        | 0x00     |
| 1.40   | 1        | 0x01     |
| 1.30   | 2        | 0x02     |
| 1.20   | 3        | 0x03     |
| 1.10   | 4        | 0x04     |
| 1.00   | 5        | 0x05     |
| 0.95   | 6        | 0x06     |
| 0.90   | 7        | 0x07     |
| 0.85   | 8        | 0x08     |
| 0.80   | 9        | 0x09     |
| 0.75   | 10       | 0x0A     |
| 0.70   | 11       | 0x0B     |
| 0.66̅   | 12       | 0x0C     |
| 0.60   | 13       | 0x0D     |
| 0.55   | 14       | 0x0E     |
| 0.50   | 15       | 0x0F     |
| 0.45   | 16       | 0x10     |
| 0.40   | 17       | 0x11     |
| 0.33̅   | 18       | 0x12     |
| 0.30   | 19       | 0x13     |
| 0.25   | 20       | 0x14     |
| 0.20   | 21       | 0x15     |
| 0.16̅   | 22       | 0x16     |
| 0.13   | 23       | 0x17     |
| 0.11̅   | 24       | 0x18     |
 */

const WIDTH_TO_VV: readonly WidthMidiPoint[] = [
	{ width: 1.5, midiValue: 0 },
	{ width: 1.4, midiValue: 1 },
	{ width: 1.3, midiValue: 2 },
	{ width: 1.2, midiValue: 3 },
	{ width: 1.1, midiValue: 4 },
	{ width: 1.0, midiValue: 5 },
	{ width: 0.95, midiValue: 6 },
	{ width: 0.9, midiValue: 7 },
	{ width: 0.85, midiValue: 8 },
	{ width: 0.8, midiValue: 9 },
	{ width: 3 / 4, midiValue: 10 }, // 0.75
	{ width: 0.7, midiValue: 11 },
	{ width: 2 / 3, midiValue: 12 }, // 0.666...
	{ width: 0.6, midiValue: 13 },
	{ width: 0.55, midiValue: 14 },
	{ width: 0.5, midiValue: 15 },
	{ width: 0.45, midiValue: 16 },
	{ width: 0.4, midiValue: 17 },
	{ width: 1 / 3, midiValue: 18 }, // 0.333...
	{ width: 0.3, midiValue: 19 },
	{ width: 1 / 4, midiValue: 20 }, // 0.25
	{ width: 0.2, midiValue: 21 },
	{ width: 1 / 6, midiValue: 22 }, // 0.166...
	{ width: 0.13, midiValue: 23 },
	{ width: 1 / 9, midiValue: 24 }, // 0.111...
] as const

export const convertEqWidthToMidiValue = (width: number): number => {
	let best = WIDTH_TO_VV[0]
	let bestDiff = Math.abs(width - best.width)

	for (let i = 1; i < WIDTH_TO_VV.length; i++) {
		const p = WIDTH_TO_VV[i]
		const diff = Math.abs(width - p.width)
		if (diff < bestDiff) {
			best = p
			bestDiff = diff
		}
	}

	return best.midiValue
}

export const convertPreampGainToMidiValue = (gain: number): number => Math.round(((gain - 5) / 55) * 0x7f)

export const midiValueToEqFrequency = (midiValue: number): number => Math.round(20 * Math.pow(1000, midiValue / 127))

export const midiValueToHpfFrequency = (midiValue: number): number => Math.round(20 * Math.pow(100, midiValue / 127))
