import { validateCart } from '@open-tender/js'
import { pending, fulfill, reject } from '../utils'
import {
  RESET_MENU,
  RESET_MENU_VARS,
  RESET_CART_ERRORS,
  SET_CART_ERRORS,
  FETCH_MENU,
} from '../reducers/menu'
import { setCart, setAlert, refreshRevenueCenter } from './order'

// action creators

export const resetMenu = () => ({ type: RESET_MENU })
export const resetMenuVars = () => ({ type: RESET_MENU_VARS })
export const resetCartErrors = () => ({ type: RESET_CART_ERRORS })
export const setCartErrors = (newCart, errors) => ({
  type: SET_CART_ERRORS,
  payload: { newCart, errors },
})

// async action creators

export const fetchMenu = menuVars => async (dispatch, getState) => {
  const { api } = getState().config
  if (!api) return
  dispatch(pending(FETCH_MENU))
  const { revenueCenterId, serviceType, requestedAt, skipCartValidate } = menuVars
  try {
    if (requestedAt === null) {
      const err = getState().data.menu.error
      return dispatch(reject(FETCH_MENU, err))
    }
    const menu = await api.getMenu(revenueCenterId, serviceType, requestedAt)
    const { cart } = getState().data.order
    const {
      menu: categories,
      sold_out_items: soldOut,
      revenue_centers: revenueCenters,
    } = menu
    if (!skipCartValidate) {
      const { newCart, errors } = validateCart(cart, categories, soldOut)
      if (errors) {
        dispatch(setCartErrors(newCart, errors))
        dispatch(setAlert({ type: 'cartErrors' }))
      } else {
        dispatch(setCart(newCart))
        dispatch(resetCartErrors())
      }
    }
    dispatch(
      fulfill(FETCH_MENU, { categories, soldOut, revenueCenters, menuVars })
    )
  } catch (err) {
    dispatch(refreshRevenueCenter(menuVars, true))
    dispatch(reject(FETCH_MENU, err))
  }
}
