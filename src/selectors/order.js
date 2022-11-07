import {
  orderTypeNamesMap,
  serviceTypeNamesMap,
  timezoneMap,
  getUserTimezone,
} from '@open-tender/js'

export const selectAlert = state => state.data.order.alert

export const selectMessages = state => state.data.order.messages

export const selectOrder = state => state.data.order

export const selectOrderType = state => state.data.order.orderType

export const selectOrderTypeName = state =>
  orderTypeNamesMap[state.data.order.orderType]

export const selectServiceType = state => state.data.order.serviceType

export const selectServiceTypeName = state =>
  serviceTypeNamesMap[state.data.order.serviceType]

export const selectAutoSelect = state => {
  const autoSelect = state.config.settings.autoSelect
  const { orderType, serviceType } = state.data.order
  return orderType && serviceType ? autoSelect[orderType][serviceType] : false
}

export const selectOrderFrequency = state => state.data.order.orderFrequency

export const selectRequestedAt = state =>
  state.data.order.requestedAt === 'asap'
    ? 'ASAP'
    : state.data.order.requestedAt

export const selectRevenueCenter = state => state.data.order.revenueCenter

// TODO: need to replace this
export const selectRevenueCenterName = state =>
  state.data.order.revenueCenter ? state.data.order.revenueCenter.name : null

export const selectTimezone = state => {
  return state.data.order.revenueCenter
    ? timezoneMap[state.data.order.revenueCenter.timezone]
    : getUserTimezone()
}

export const selectOrderLimits = state => {
  const { revenueCenter, serviceType } = state.data.order
  if (!revenueCenter || !serviceType) {
    return { orderMinimum: null, orderMaximum: null }
  }
  const { cartId, cartGuest, spendingLimit } = state.data.groupOrder
  const { order_maximum, order_minimum } =
    revenueCenter.settings || revenueCenter
  const orderMax =
    cartGuest && spendingLimit ? spendingLimit : order_maximum[serviceType]
  let orderMaximum = parseFloat(orderMax)
  let orderMinimum = cartId ? 0 : parseFloat(order_minimum[serviceType])
  return {
    orderMinimum: orderMinimum > 0 ? orderMinimum : null,
    orderMaximum: orderMaximum > 0 ? orderMaximum : null,
  }
}

export const selectAddress = state => state.data.order.address

export const selectMenuSlug = state => {
  const { revenueCenter } = state.data.order
  return revenueCenter ? `/menu/${revenueCenter.slug}` : '/'
}

export const selectMenuVars = state => {
  if (!state.data.order.revenueCenter) return {}
  return {
    revenueCenterId: state.data.order.revenueCenter.revenue_center_id,
    serviceType: state.data.order.serviceType,
    requestedAt: state.data.order.requestedAt,
  }
}

export const selectCurrentVendor = state => state.data.order.currentVendor

export const selectCurrentCategory = state => state.data.order.currentCategory

export const selectCurrentItem = state => state.data.order.currentItem

export const selectCart = state => state.data.order.cart

export const selectCartIds = state => {
  return state.data.order.cart ? state.data.order.cart.map(i => i.id) : []
}

export const selectCartQuantity = state => {
  return state.data.order.cart
    ? state.data.order.cart.reduce((t, i) => (t += i.quantity), 0)
    : 0
}

export const selectCartTotal = state => {
  return state.data.order.cart
    ? state.data.order.cart.reduce((t, i) => (t += i.totalPrice), 0.0)
    : 0.0
}

export const selectCartCounts = state => state.data.order.cartCounts || {}

export const selectCanOrder = state =>
  state.data.order.revenueCenter &&
  state.data.order.serviceType &&
  state.data.order.requestedAt

export const selectCartValidate = state => {
  const { revenueCenter, serviceType, requestedAt, cart } =
    state.data.order || {}
  if (!revenueCenter) return null
  const revenueCenterId = revenueCenter.revenue_center_id
  return {
    revenueCenterId,
    serviceType,
    requestedAt,
    cart,
  }
}
