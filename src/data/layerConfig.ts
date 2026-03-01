import type { RelationshipChain } from '../types'

export const SCHOOL_LAYER_NAMES = ['Departments', 'Professors', 'Courses', 'Students']

export const SCHOOL_RELATIONSHIP_CHAIN: RelationshipChain = [
  ['has_faculty'],
  ['teaches'],
  ['enrolled_in'],
]
