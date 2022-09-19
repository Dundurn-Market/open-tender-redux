import { combineReducers } from 'redux'
import account from './account'
import allergens from './allergens'
import addresses from './addresses'
import creditCards from './creditCards'
import giftCards from './giftCards'
import favorites from './favorites'
import houseAccounts from './houseAccounts'
import orders from './orders'
import order from './order'
import groupOrders from './groupOrders'
import rewards from './rewards'
import loyalty from './loyalty'
import levelup from './levelup'
import thanx from './thanx'
import qrcode from './qrcode'
import communicationPreferences from './communicationPreferences'
import fcmToken from './fcmToken'
import recurrences from './recurrences'

const customerReducer = combineReducers({
  account,
  allergens,
  addresses,
  creditCards,
  giftCards,
  favorites,
  houseAccounts,
  orders,
  order,
  groupOrders,
  rewards,
  loyalty,
  levelup,
  thanx,
  qrcode,
  communicationPreferences,
  fcmToken,
  recurrences
})

export default customerReducer
