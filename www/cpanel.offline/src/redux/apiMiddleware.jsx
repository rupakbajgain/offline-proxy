const apiMiddleware = store => next => action => {
  if (!action.meta || action.meta.type !== 'api') {
    return next(action);
  }
  
  let newAction = Object.assign({}, action, {
    payload: 'Rupak'
  });
  delete newAction.meta;
  store.dispatch(newAction);
}
export default apiMiddleware