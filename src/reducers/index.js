import { combineReducers } from 'redux'
import order from './order'
import revenueCenters from './revenueCenters'
import validTimes from './validTimes'
import menu from './menu'
import menuItems from './menuItems'
import menuDisplay from './menuDisplay'
import menuPages from './menuPages'
import allergens from './allergens'
import checkout from './checkout'
import notifications from './notifications'
import alerts from './alerts'
import confirmation from './confirmation'
import customer from './customer'
import resetPassword from './resetPassword'
import signUp from './signUp'
import groupOrder from './groupOrder'
import levelup from './levelup'
import orders from './orders'
import completedOrders from './completedOrders'
import ordersSearch from './ordersSearch'
import settings from './settings'
import orderFulfillment from './orderFulfillment'
import orderRating from './orderRating'
import refund from './refund'
import giftCards from './giftCards'
import donations from './donations'
import deals from './deals'
import verifyAccount from './verifyAccount'
import announcements from './announcements'
import guest from './guest'
import globalMenuItems from './globalMenuItems'

const openTenderReducer = combineReducers({
  order,
  revenueCenters,
  validTimes,
  menu,
  menuItems,
  menuDisplay,
  menuPages,
  allergens,
  checkout,
  notifications,
  alerts,
  confirmation,
  resetPassword,
  signUp,
  customer,
  groupOrder,
  levelup,
  orders,
  completedOrders,
  ordersSearch,
  settings,
  orderFulfillment,
  orderRating,
  refund,
  giftCards,
  donations,
  deals,
  verifyAccount,
  announcements,
  guest,
  globalMenuItems
})

export default openTenderReducer
