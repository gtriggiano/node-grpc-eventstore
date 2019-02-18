import * as t from 'io-ts'

import { Insertion } from './Insertion'

export const InsertionsList = t.array(Insertion, 'InsertionsList')
