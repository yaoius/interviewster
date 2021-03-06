import createHistory from 'history/createBrowserHistory';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';
import { routerMiddleware, connectRouter } from 'connected-react-router';

import admin from './admin';
import auth from './auth';
import common from './common';
import guide from './guide';
import guides from './guides';

const history = createHistory();

const reducer = combineReducers({
  admin,
  auth,
  common,
  guide,
  guides,
  router: connectRouter(history)
});

const routeMiddleware = routerMiddleware(history);
const middleware = [ routeMiddleware, thunk ];
let composeFn = compose;

if (!__IS_PRODUCTION__) {
  middleware.push(createLogger());
  composeFn = composeWithDevTools;
}

const store = createStore(reducer, composeFn(applyMiddleware(...middleware)));

export {
  history,
  store
};
