import {
  makeCustomerProfile,
  makeFavoritesLookup,
  makeFormErrors,
} from '@open-tender/js'
import { pending, fulfill, reject, MISSING_CUSTOMER } from '../../utils'
import {
  RESET_CUSTOMER,
  RESET_LOGIN_ERROR,
  LOGIN_CUSTOMER,
  LOGOUT_CUSTOMER,
  FETCH_CUSTOMER,
  UPDATE_CUSTOMER,
  VERIFY_CUSTOMER,
  LINK_POS_TOKEN,
  DELETE_CUSTOMER,
} from '../../reducers/customer/account'
import { setSelectedAllergens } from '../allergens'
import { setAlert, addMessage, resetOrder } from '../order'
import { resetCheckout, updateCheckoutCustomer } from '../checkout'
import { showNotification } from '../notifications'
import { selectToken } from '../../selectors/customer'
import { resetCustomerAddresses } from './addresses'
import { setCustomerAllergens, resetCustomerAllergens } from './allergens'
import { resetCustomerCreditCards } from './creditCards'
import {
  setCustomerFavorites,
  setCustomerFavoritesLookup,
  resetCustomerFavorites,
} from './favorites'
import { setCustomerGiftCards, resetCustomerGiftCards } from './giftCards'
import { resetCustomerHouseAccounts } from './houseAccounts'
import { resetCustomerLoyalty } from './loyalty'
import { resetCustomerOrder } from './order'
import { resetCustomerOrders } from './orders'
import { resetGroupOrder } from '../groupOrder'
import { resetGuest } from '../guest'
import { resetCustomerCommunicationPreferences } from './communicationPreferences'
import { setCustomerLevelUp, resetCustomerLevelUp } from './levelup'
import { resetCustomerRewards } from './rewards'
import { resetCustomerRecurrences } from './recurrences'

// action creators

export const resetCustomer = () => ({ type: RESET_CUSTOMER })
export const resetLoginError = () => ({ type: RESET_LOGIN_ERROR })

// async action creators

export const loginCustomer =
  (email, password) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(LOGIN_CUSTOMER))
    try {
      const auth = await api.postLogin(email, password)
      dispatch(fulfill(LOGIN_CUSTOMER, auth))
      dispatch(fetchCustomer())
    } catch (err) {
      dispatch(reject(LOGIN_CUSTOMER, err))
    }
  }

export const logoutCustomer = isReset => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  const token = selectToken(getState())
  if (!token) return dispatch(reject(LOGOUT_CUSTOMER, null))
  dispatch(pending(LOGOUT_CUSTOMER))
  try {
    if (isReset) {
      dispatch(resetOrder())
      dispatch(resetCheckout())
      dispatch(setSelectedAllergens(null))
    }
    await api.postLogout(token)
    dispatch(updateCheckoutCustomer(null))
    dispatch(resetCustomerAddresses())
    dispatch(resetCustomerAllergens())
    dispatch(resetCustomerCreditCards())
    dispatch(resetCustomerFavorites())
    dispatch(resetCustomerLevelUp())
    dispatch(resetCustomerGiftCards())
    dispatch(resetCustomerHouseAccounts())
    dispatch(resetCustomerLoyalty())
    dispatch(resetCustomerOrder())
    dispatch(resetCustomerOrders())
    dispatch(resetCustomerRecurrences())
    dispatch(resetGroupOrder())
    dispatch(resetCustomerRewards())
    dispatch(resetCustomerCommunicationPreferences())
    dispatch(resetGuest())
    dispatch(setSelectedAllergens(null))
    dispatch(fulfill(LOGOUT_CUSTOMER, null))
  } catch (err) {
    dispatch(reject(LOGOUT_CUSTOMER, null))
  }
}

export const checkAuth = (err, reject) => async dispatch => {
  if (err.status === 401) {
    await dispatch(logoutCustomer())
    dispatch(addMessage('Please login to reauthenticate your account'))
  } else {
    dispatch(reject())
  }
}

export const linkPosToken = posToken => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  const token = selectToken(getState())
  if (!token) return dispatch(reject(LINK_POS_TOKEN, MISSING_CUSTOMER))
  dispatch(pending(LINK_POS_TOKEN))
  try {
    await api.postCustomerPosToken(token, posToken)
    dispatch(showNotification('Order successfully linked!'))
    dispatch(fulfill(LINK_POS_TOKEN))
  } catch (err) {
    dispatch(addMessage(err.detail || err.message))
    dispatch(reject(LINK_POS_TOKEN))
  }
}

export const fetchCustomer = () => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  const token = selectToken(getState())
  if (!token) return dispatch(reject(FETCH_CUSTOMER, MISSING_CUSTOMER))
  dispatch(pending(FETCH_CUSTOMER))
  try {
    const customer = await api.getCustomer(token)
    const { allergens, gift_cards, favorites, levelup } = customer
    dispatch(setCustomerAllergens(allergens || []))
    dispatch(setSelectedAllergens(allergens || []))
    dispatch(setCustomerGiftCards(gift_cards || []))
    dispatch(setCustomerFavorites(favorites || []))
    dispatch(setCustomerLevelUp(levelup || []))
    const lookup = makeFavoritesLookup(favorites)
    dispatch(setCustomerFavoritesLookup(lookup || {}))
    const profile = makeCustomerProfile(customer)
    dispatch(fulfill(FETCH_CUSTOMER, profile))
  } catch (err) {
    dispatch(checkAuth(err, () => reject(FETCH_CUSTOMER, err)))
  }
}

export const updateCustomer =
  (data, callback) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    const token = selectToken(getState())
    if (!token) return dispatch(reject(UPDATE_CUSTOMER, MISSING_CUSTOMER))
    dispatch(pending(UPDATE_CUSTOMER))
    try {
      const customer = await api.putCustomer(token, data)
      const profile = makeCustomerProfile(customer)
      dispatch(fulfill(UPDATE_CUSTOMER, profile))
      dispatch(showNotification('Account updated!'))
      if (callback) callback(data)
    } catch (err) {
      const errors = makeFormErrors(err)
      dispatch(checkAuth(err, () => reject(UPDATE_CUSTOMER, errors)))
    }
  }

export const deleteCustomer =
  (data, callback) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    const token = selectToken(getState())
    if (!token) return dispatch(reject(DELETE_CUSTOMER, MISSING_CUSTOMER))
    dispatch(pending(DELETE_CUSTOMER))
    try {
      await api.deleteCustomer(token)
      await api.postLogout(token)
      dispatch(updateCheckoutCustomer(null))
      dispatch(resetCustomerAddresses())
      dispatch(resetCustomerAllergens())
      dispatch(resetCustomerCreditCards())
      dispatch(resetCustomerFavorites())
      dispatch(resetCustomerLevelUp())
      dispatch(resetCustomerGiftCards())
      dispatch(resetCustomerHouseAccounts())
      dispatch(resetCustomerLoyalty())
      dispatch(resetCustomerOrder())
      dispatch(resetCustomerOrders())
      dispatch(resetGroupOrder())
      dispatch(resetCustomerRewards())
      dispatch(resetCustomerCommunicationPreferences())
      dispatch(resetGuest())
      dispatch(fulfill(DELETE_CUSTOMER))
      dispatch(showNotification('Account deleted!'))
      if (callback) callback(data)
    } catch (err) {
      dispatch(checkAuth(err, () => reject(DELETE_CUSTOMER, err)))
    }
  }

export const sendCustomerVerificationEmail =
  linkUrl => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    const token = selectToken(getState())
    if (!token) {
      dispatch(addMessage('Missing customer token'))
      return dispatch(reject(VERIFY_CUSTOMER))
    }
    dispatch(pending(VERIFY_CUSTOMER))
    try {
      await api.postSendVerificationEmail(token, linkUrl)
      dispatch(showNotification('Verification email sent!'))
      dispatch(fulfill(VERIFY_CUSTOMER))
    } catch (err) {
      dispatch(addMessage(err.detail || err.message))
      dispatch(reject(VERIFY_CUSTOMER))
    }
  }

export const loginCustomerThanx =
  (email, origin) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(LOGIN_CUSTOMER))
    try {
      await api.postThanxLogin(email, origin)
      dispatch(setAlert({ type: 'close' }))
      dispatch(addMessage('Thanks! Please check your email on this device.'))
      dispatch(fulfill(LOGIN_CUSTOMER, null))
    } catch (err) {
      const error = err.params ? err.params['$.email'] : null
      if (error && error.includes("'email'")) {
        err.detail = 'Please enter a valid email address'
      }
      dispatch(reject(LOGIN_CUSTOMER, err))
    }
  }

export const authCustomerThanx =
  (code, path, origin) => async (dispatch, getState) => {
    const { api } = getState().config
    if (!api) return
    dispatch(pending(LOGIN_CUSTOMER))
    try {
      const auth = await api.postThanxAuth(code, path, origin)
      dispatch(fulfill(LOGIN_CUSTOMER, auth))
      dispatch(fetchCustomer())
    } catch (err) {
      dispatch(reject(LOGIN_CUSTOMER, err))
    }
  }
