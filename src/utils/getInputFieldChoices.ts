import { DropdownChoice } from '@companion-module/base'
import { times } from 'lodash/fp'

export const getChoices = (labelPrefix: string, labelCount: number): DropdownChoice[] =>
	times((id: number) => ({ label: `${labelPrefix} ${id + 1}`, id }))(labelCount)
