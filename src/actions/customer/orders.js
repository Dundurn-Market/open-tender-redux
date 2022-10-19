import { pending, fulfill, reject, MISSING_CUSTOMER } from '../../utils'
import { name, entity } from '../../reducers/customer/orders'
import { selectToken } from '../../selectors/customer'
import { checkAuth } from './account'
import { showNotification } from '../notifications'
import { addMessage, setAlert } from '../order'

// action creators

export const resetCustomerOrders = () => ({ type: `${name}/reset${entity}` })
export const resetCustomerOrdersError = () => ({
  type: `${name}/reset${entity}Error`,
})
export const setCustomerOrders = orders => ({
  type: `${name}/set${entity}`,
  payload: orders,
})

// async action creators

export const fetchCustomerOrders = limit => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  const token = selectToken(getState())
  if (!token)
    return dispatch(reject(`${name}/fetch${entity}`, MISSING_CUSTOMER))
  dispatch(pending(`${name}/fetch${entity}`))
  try {
    const { data: orders } = await api.getCustomerOrders(token, limit)
    dispatch(fulfill(`${name}/fetch${entity}`, orders))
  } catch (err) {
    dispatch(checkAuth(err, () => reject(`${name}/fetch${entity}`, err)))
  }
}

export const deleteCustomerOrder = orderId => async (dispatch, getState) => {
  const { api, recurrenceApi } = getState().config
  if (!recurrenceApi) return
  const token = selectToken(getState())
  if (!token) {
    dispatch(showNotification('There was an issue removing order! User is not authorized'))
  }
  dispatch(pending(`${name}/remove${entity}`))
  dispatch(setAlert({ type: 'working', args: { text: 'Cancelling Order...' } }))
  try {
    const response = await recurrenceApi.deleteOrder(orderId, token)
    if (!response.error) {
      const { data: orders } = await api.getCustomerOrders(token, null)
      dispatch(fulfill(`${name}/remove${entity}`, orders))
      dispatch(setAlert({ type: 'close' }))
      dispatch(addMessage('The order was successfully cancelled! Subscriptions relating to this order can be managed on the subscriptions page.'))
    } else {
      dispatch(showNotification('There was an issue removing order! Order was not deleted.'))
    }
  } catch (err) {
    dispatch(showNotification('There was an issue removing order! Order was not deleted.'))
  }
}
