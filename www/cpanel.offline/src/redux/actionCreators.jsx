import * as types from './type.jsx';

export const fetchNewTime = () => ({
  type: types.FETCH_NEW_TIME,
  payload: new Date().toString(),
  meta: {
    type: 'api',
    url: 'test.json'
  }
})

export const login = (user) => ({
type: types.LOGIN,
payload: user
})
// ...
export const logout = () => ({
type: types.LOGOUT,
})