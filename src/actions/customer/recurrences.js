import { selectToken } from '../../selectors'
import { fulfill, MISSING_CUSTOMER, pending, reject } from '../../utils'
import { entity, name } from '../../reducers/customer/recurrences'
import { checkAuth } from './account'

export const fetchCustomerRecurrences = () => async (
  dispatch,
  getState
) => {
  const { recurrenceApi } = getState().config
  if (!recurrenceApi) return
  const token = selectToken(getState())
  if (!token)
    return dispatch(reject(`${name}/fetch${entity}`, MISSING_CUSTOMER))
  dispatch(pending(`${name}/fetch${entity}`))
  try {
    const recurrences = await recurrenceApi.getRecurrences(token)
    dispatch(fulfill(`${name}/fetch${entity}`, recurrences))
  } catch (err) {
    dispatch(checkAuth(err, () => reject(`${name}/fetch${entity}`, err)))
  }
}