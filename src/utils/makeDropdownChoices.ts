import { DropdownChoice } from '@companion-module/base'
import { times } from 'lodash/fp'

/**
 * Helper function for making a set of choices to use in a Companion action dropdown
 * @param labelPrefix The string to prefix each label with, e.g. 'Channel, 'DCA' etc
 * @param labelCount The number of labels to create
 * @returns An array of dropdown choices, e.g [{ id: 0, label: 'Channel 1' }, etc...]
 */
export const makeDropdownChoices = (labelPrefix: string, labelCount: number): DropdownChoice[] =>
	times((id: number) => ({ label: `${labelPrefix} ${id + 1}`, id }))(labelCount)
