import { entitiesReducer } from '../../utils'

export const name = 'customer/recurrences'
export const entity = 'CustomerRecurrences'

export default (state, action) => {
  return entitiesReducer(state, action, name, entity)
}