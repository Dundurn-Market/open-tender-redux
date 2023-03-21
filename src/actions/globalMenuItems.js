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
    const revenueCenters = await api.getRevenueCenters('OLO')
    const revenueCenterIds = revenueCenters.data.map((i) => i.revenue_center_id)

    const menuItems = await revenueCenterIds.reduce(
      async (aggregate, i) => {
        const current = await aggregate
        const rcItems = [
          ...(await api.getMenuItems(i, 'PICKUP')),
          ...(await api.getMenuItems(i, 'DELIVERY')),
        ]

        current.push(
          ...rcItems.filter((n) => !(current.find((m) => m.id === n.id))),
        )
        return current
      },
      [],
    )
    dispatch(fulfill(FETCH_GLOBAL_MENU_ITEMS, menuItems))
  } catch (err) {
    dispatch(reject(FETCH_GLOBAL_MENU_ITEMS, err))
  }
}