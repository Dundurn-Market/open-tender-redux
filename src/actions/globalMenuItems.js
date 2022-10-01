import { fulfill, pending, reject } from '../utils'
import { FETCH_GLOBAL_MENU_ITEMS } from '../reducers/globalMenuItems'

export const fetchGlobalMenuItems = () => async (
  dispatch,
  getState
) => {
  const { api } = getState().config
  if (!api) return
  dispatch(pending(FETCH_GLOBAL_MENU_ITEMS))
  try {

    const strathconaMenuItems = await api.getMenuItems(1502, 'PICKUP') //strathcona mrkt pickup
    const deliveryMenuItems = await api.getMenuItems(1506, 'DELIVERY') //hamilton delivery zone

    let menuItems = [...strathconaMenuItems]
    deliveryMenuItems.forEach((item) => {
      if (!menuItems.find((i) => i.id === item.id)) {
        menuItems.push(item)
      }
    })
    dispatch(fulfill(FETCH_GLOBAL_MENU_ITEMS, menuItems))
  } catch (err) {
    dispatch(reject(FETCH_GLOBAL_MENU_ITEMS, err))
  }
}