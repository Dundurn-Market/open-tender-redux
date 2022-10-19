import { selectToken } from '../../selectors'
import { fulfill, MISSING_CUSTOMER, pending, reject } from '../../utils'
import { entity, name } from '../../reducers/customer/recurrences'
import { checkAuth } from './account'
import { showNotification } from '../notifications'
import { addMessage, setAlert } from '../order'

export const resetCustomerRecurrences = () => ({ type: `${name}/reset${entity}` })
export const fetchCustomerRecurrences = () => async (
  dispatch,
  getState
) => {
  const { recurrenceApi } = getState().config
  if (!recurrenceApi) return
  const token = selectToken(getState())
  if (!token) {
    return dispatch(reject(`${name}/fetch${entity}`, MISSING_CUSTOMER))
  }
  dispatch(pending(`${name}/fetch${entity}`))
  try {
    const recurrences = await recurrenceApi.getRecurrences(token)
    if (recurrences.error) {
      logRecurrenceError(dispatch, recurrences.error)
      return dispatch(reject(`${name}/fetch${entity}`, recurrences.error))
    }
    dispatch(fulfill(`${name}/fetch${entity}`, recurrences))
  } catch (err) {
    dispatch(checkAuth(err, () => reject(`${name}/fetch${entity}`, err)))
  }
}

export const setCustomerRecurrences = recurrences => ({
  type: `${name}/set${entity}`,
  payload: recurrences,
})

export const removeRecurrence = (recurrenceId, callback) => async (
  dispatch,
  getState
) => {
  const { recurrenceApi } = getState().config
  if (!recurrenceApi) return
  const token = selectToken(getState())
  if (!token) {
    return dispatch(reject(`${name}/remove${entity}`, MISSING_CUSTOMER))
  }

  const alert = { type: 'working', args: { text: 'Deleting Recurrence...' } }
  dispatch(setAlert(alert))
  dispatch(pending(`${name}/remove${entity}`))
  try {
    const deleteResponse = await recurrenceApi.deleteRecurrence(recurrenceId, token)
    if (deleteResponse.success) {
      const recurrences = await recurrenceApi.getRecurrences(token)

      if (recurrences.error) {
        logRecurrenceError(dispatch, recurrences.error)
        return dispatch(reject(`${name}/remove${entity}`, recurrences.error))
      }

      dispatch(fulfill(`${name}/remove${entity}`, recurrences))
      dispatch(showNotification('Subscription removed!'))
    } else {
      dispatch(reject(`${name}/remove${entity}`, deleteResponse))
    }
    dispatch(setAlert({ type: 'close' }))

    if (callback) callback()
  } catch (err) {
    dispatch(setAlert({ type: 'close' }))
    dispatch(checkAuth(err, () => reject(`${name}/remove${entity}`, err)))
  }
}

export const logRecurrenceError = (dispatch, err) => {
  console.log(err)
  dispatch(addMessage('!DEVELOPMENT MSG! There was an error fetching recurrences. Check log.'))
}