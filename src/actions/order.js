import {
  rehydrateCart,
  rehydrateCartWithRecurrences,
  rehydrateCheckoutForm,
  makeFirstRequestedAt,
  makeFirstTimes,
} from '@open-tender/js'
import { pending, fulfill, reject } from '../utils'
import {
  RESET_ORDER,
  RESET_ORDER_TYPE,
  RESET_REVENUE_CENTER,
  RESET_CART,
  RESET_MESSAGES,
  RESET_ALERT,
  SET_ORDER_ID,
  SET_ORDER_TYPE,
  SET_SERVICE_TYPE,
  SET_ORDER_SERVICE_TYPE,
  SET_CURBSIDE,
  SET_DEVICE_TYPE,
  SET_MENU_VARS,
  SET_REVENUE_CENTER,
  SET_ADDRESS,
  SET_REQUESTED_AT,
  SET_CART,
  SET_CURRENT_VENDOR,
  SET_CURRENT_CATEGORY,
  SET_CURRENT_ITEM,
  SET_ALERT,
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  ADD_ITEM,
  REMOVE_ITEM,
  INCREMENT_ITEM,
  DECREMENT_ITEM,
  FETCH_REVENUE_CENTER,
  FETCH_LOCATION,
  REVERT_MENU,
  REFRESH_REVENUE_CENTER,
  EDIT_ORDER,
  REORDER,
  CHECKOUT,
  SET_TABLE,
  SET_PREP_TYPE,
  SET_DEFAULT_ORDER_FREQ, SET_ITEM_FREQUENCY, REMOVE_ITEM_BY_ID, SET_ORDER_WINDOW
} from '../reducers/order'
import { setMenuItems } from './menuItems'
import { updateForm } from './checkout'
import { resetMenuVars } from './menu'
import { setCustomerRecurrences } from './customer'

// action creators

export const resetOrder = () => ({ type: RESET_ORDER })
export const resetOrderType = () => ({ type: RESET_ORDER_TYPE })
export const resetRevenueCenter = () => ({ type: RESET_REVENUE_CENTER })
export const resetLocation = () => ({ type: RESET_REVENUE_CENTER })
export const resetCart = () => ({ type: RESET_CART })
export const resetMessages = () => ({ type: RESET_MESSAGES })
export const resetAlert = () => ({ type: RESET_ALERT })

// no change to state, used purely to dispatch an action for
// a Google Tag Manager event
export const checkout = () => ({ type: CHECKOUT })

export const updateOrder = data => ({
  type: SET_ALERT,
  payload: data,
})
export const setAlert = alert => ({
  type: SET_ALERT,
  payload: alert,
})
export const setOrderId = orderId => ({
  type: SET_ORDER_ID,
  payload: orderId,
})
export const setOrderType = orderType => ({
  type: SET_ORDER_TYPE,
  payload: orderType,
})
export const setServiceType = serviceType => ({
  type: SET_SERVICE_TYPE,
  payload: serviceType,
})
export const setOrderServiceType = (
  orderType,
  serviceType,
  isOutpost,
  isCurbside
) => ({
  type: SET_ORDER_SERVICE_TYPE,
  payload: {
    orderType,
    serviceType,
    isOutpost: isOutpost || false,
    isCurbside: isCurbside || false,
  },
})
export const setCurbside = bool => ({
  type: SET_CURBSIDE,
  payload: bool,
})
export const setDeviceType = deviceType => ({
  type: SET_DEVICE_TYPE,
  payload: deviceType,
})
export const setMenuVars = (revenueCenter, serviceType, requestedAt) => ({
  type: SET_MENU_VARS,
  payload: { revenueCenter, serviceType, requestedAt },
})
export const setAddress = address => ({
  type: SET_ADDRESS,
  payload: address,
})
export const setRequestedAt = requestedAt => ({
  type: SET_REQUESTED_AT,
  payload: requestedAt,
})
export const setOrderWindow = orderBy => ({
  type: SET_ORDER_WINDOW,
  payload: orderBy,
})
export const setDefaultOrderFrequency = orderFrequency => ({
  type: SET_DEFAULT_ORDER_FREQ,
  payload: orderFrequency,
})
export const setRevenueCenter = revenueCenter => ({
  type: SET_REVENUE_CENTER,
  payload: revenueCenter,
})
export const setTable = table => ({
  type: SET_TABLE,
  payload: table,
})
export const setPrepType = prepType => ({
  type: SET_PREP_TYPE,
  payload: prepType,
})
export const setCart = cart => ({
  type: SET_CART,
  payload: cart,
})
export const setCurrentItem = item => ({
  type: SET_CURRENT_ITEM,
  payload: item,
})
export const setCurrentCategory = item => ({
  type: SET_CURRENT_CATEGORY,
  payload: item,
})
export const setCurrentVendor = item => ({
  type: SET_CURRENT_VENDOR,
  payload: item,
})
export const addItemToCart = item => ({
  type: ADD_ITEM,
  payload: item,
})
export const removeItemFromCart = item => ({
  type: REMOVE_ITEM,
  payload: item,
})
export const incrementItemInCart = item => ({
  type: INCREMENT_ITEM,
  payload: item,
})
export const decrementItemInCart = item => ({
  type: DECREMENT_ITEM,
  payload: item,
})
export const setCartItemFrequency = item => ({
  type: SET_ITEM_FREQUENCY,
  payload: item,
})
export const addMessage = message => ({
  type: ADD_MESSAGE,
  payload: message,
})
export const removeMessage = id => ({
  type: REMOVE_MESSAGE,
  payload: id,
})

// async action creators

export const fetchRevenueCenter =
  (revenueCenterId, requestedAt) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(FETCH_REVENUE_CENTER))
    try {
      const revenueCenter = await api.getRevenueCenter(
        revenueCenterId,
        requestedAt
      )
      dispatch(setRevenueCenter(revenueCenter))
      dispatch(fulfill(FETCH_REVENUE_CENTER))
    } catch (err) {
      dispatch(reject(FETCH_REVENUE_CENTER, err))
    }
  }

export const fetchLocation = revenueCenterId => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  dispatch(pending(FETCH_LOCATION))
  try {
    const revenueCenter = await api.getLocation(revenueCenterId)
    dispatch(setRevenueCenter(revenueCenter))
    dispatch(fulfill(FETCH_LOCATION))
  } catch (err) {
    dispatch(reject(FETCH_LOCATION, err))
  }
}

export const revertMenu =
  ({ revenueCenterId, serviceType, requestedAt }) =>
  async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(REVERT_MENU))
    try {
      const revenueCenter = await api.getLocation(revenueCenterId)
      dispatch(setMenuVars(revenueCenter, serviceType, requestedAt))
      dispatch(fulfill(REVERT_MENU, revenueCenter))
    } catch (err) {
      dispatch(reject(REVERT_MENU, err))
    }
  }

export const refreshRevenueCenter =
  ({ revenueCenterId, serviceType, requestedAt }, reset) =>
  async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(REFRESH_REVENUE_CENTER))
    try {
      const revenueCenter = await api.getLocation(revenueCenterId)
      if (reset) requestedAt = null
      const firstTimes = makeFirstTimes(revenueCenter, serviceType, requestedAt)
      const { status } = revenueCenter
      let alert
      if (!firstTimes || status !== 'OPEN') {
        alert = { type: 'closed', args: { status, preventClose: true } }
      } else {
        alert = {
          type: 'adjustRequestedAt',
          args: { firstTimes, revenueCenter, preventClose: true },
        }
      }
      dispatch(fulfill(REFRESH_REVENUE_CENTER, alert))
    } catch (err) {
      dispatch(reject(REFRESH_REVENUE_CENTER, err))
    }
  }

export const editOrder = (order, openSidebar = true) => async (dispatch, getState) => {
  const { api, recurrenceApi } = getState().config
  if (!api) return
  const alert = { type: 'working', args: { text: 'Building your order...' } }
  const bearerToken = getState().data.customer.account.auth ?
    getState().data.customer.account.auth.access_token : null
  dispatch(setAlert(alert))
  dispatch(pending(EDIT_ORDER))
  try {
    const {
      order_id: orderId,
      order_type: orderType,
      service_type: serviceType,
      requested_at: requestedAt,
      revenue_center,
      address,
    } = order
    const revenueCenterId = revenue_center.revenue_center_id
    const revenueCenter = await api.getLocation(revenueCenterId)
    const menuItems = await api.getMenuItems(revenueCenterId, serviceType)

    let recurrences = getState().data.customer.recurrences.entities

    if (recurrences.length === 0 && bearerToken) {
      recurrences = await recurrenceApi.getRecurrences(bearerToken)
      if (recurrences.error) {
        recurrences = []
      } else {
        dispatch(setCustomerRecurrences(recurrences))
      }
    }
    const { cart, cartCounts } = rehydrateCartWithRecurrences(menuItems, order, recurrences)
    dispatch(setMenuItems(menuItems))
    const form = rehydrateCheckoutForm(order)
    dispatch(updateForm(form))
    // dispatch(toggleSidebar())
    const isOutpost = revenueCenter.is_outpost
    const payload = {
      orderId,
      orderType,
      serviceType,
      isOutpost,
      revenueCenter,
      requestedAt,
      address,
      cart,
      cartCounts,
    }
    dispatch(fulfill(EDIT_ORDER, payload))
    if (openSidebar)
      dispatch(setAlert({ type: 'closeAndSidebar' }))
    else
      dispatch(setAlert({ type: 'close' }))
  } catch (err) {
    dispatch(resetAlert())
    dispatch(addMessage('Something went wrong. Please contact support.'))
    dispatch(reject(EDIT_ORDER, null))
  }
}

export const reorderPastOrder =
  ({ revenueCenterId, serviceType, items }) =>
  async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    const alert = { type: 'working', args: { text: 'Building your order...' } }
    dispatch(setAlert(alert))
    dispatch(pending(REORDER))
    try {
      const revenueCenter = await api.getLocation(revenueCenterId)
      const requestedAt = makeFirstRequestedAt(revenueCenter, serviceType)
      if (!requestedAt) {
        const { status } = revenueCenter
        const alert = { type: 'closed', args: { status, isCancel: true } }
        dispatch(setAlert(alert))
        dispatch(fulfill(REORDER, {}))
      } else {
        dispatch(resetMenuVars())
        dispatch(resetRevenueCenter())
        const menuItems = await api.getMenuItems(revenueCenterId, serviceType)
        const { cart, cartCounts } = rehydrateCart(menuItems, items)
        dispatch(setMenuItems(menuItems))
        const orderType = revenueCenter.revenue_center_type
        const payload = {
          revenueCenter,
          requestedAt,
          serviceType,
          cart,
          cartCounts,
        }
        dispatch(fulfill(REORDER, payload))
        const alert = {
          type: 'requestedAt',
          args: {
            openSidebar: true,
            focusFirst: true,
            skipClose: true,
            isReorder: true,
            revenueCenter,
            serviceType,
            orderType,
            requestedAt,
          },
        }
        dispatch(setAlert(alert))
      }
    } catch (err) {
      dispatch(resetAlert())
      dispatch(addMessage('Something went wrong. Please contact support.'))
      dispatch(reject(REORDER, null))
    }
  }

  const removeFromCartById = item => ({ type: REMOVE_ITEM_BY_ID, payload: item })


export const removeItemFromCartById = item => (dispatch, getState) => {
  dispatch(removeFromCartById(item))
  return getState().data.order.cart
}