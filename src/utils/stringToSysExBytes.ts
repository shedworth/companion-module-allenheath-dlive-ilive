export const stringToSysExBytes = (value: string): number[] => {
	return [...value].map((c) => c.charCodeAt(0) & 0x7f)
}
