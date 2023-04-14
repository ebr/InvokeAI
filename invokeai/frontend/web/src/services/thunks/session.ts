import { createAppAsyncThunk } from 'app/storeUtils';
import { Graph, SessionsService } from 'services/api';
import { buildGraph } from 'common/util/buildGraph';
import { isAnyOf, isFulfilled } from '@reduxjs/toolkit';
import { subscribedNodeIdsSet } from 'features/system/store/systemSlice';
import { buildNodesGraph } from 'features/nodes/util/buildNodesGraph';
import { size } from 'lodash';

export const linearGraphBuilt = createAppAsyncThunk(
  'api/linearGraphBuilt',
  async (_, { dispatch, getState }) => {
    const graph = buildGraph(getState()).graph;

    dispatch(sessionCreated({ graph }));

    return graph;
  }
);

export const nodesGraphBuilt = createAppAsyncThunk(
  'api/nodesGraphBuilt',
  async (_, { dispatch, getState }) => {
    const graph = buildNodesGraph(getState());

    dispatch(sessionCreated({ graph }));

    return graph;
  }
);

export const isFulfilledAnyGraphBuilt = isAnyOf(
  linearGraphBuilt.fulfilled,
  nodesGraphBuilt.fulfilled
);

type SessionCreatedArg = {
  graph: Parameters<
    (typeof SessionsService)['createSession']
  >[0]['requestBody'];
};

/**
 * `SessionsService.createSession()` thunk
 */
export const sessionCreated = createAppAsyncThunk(
  'api/sessionCreated',
  async (arg: SessionCreatedArg, { dispatch, getState }) => {
    const response = await SessionsService.createSession({
      requestBody: arg.graph,
    });

    return response;
  }
);

/**
 * Function to check if an action is a fulfilled `SessionsService.createSession()` thunk
 */
export const isFulfilledSessionCreatedAction = isFulfilled(sessionCreated);

type NodeAddedArg = Parameters<(typeof SessionsService)['addNode']>[0];

/**
 * `SessionsService.addNode()` thunk
 */
export const nodeAdded = createAppAsyncThunk(
  'api/nodeAdded',
  async (
    arg: { node: NodeAddedArg['requestBody']; sessionId: string },
    _thunkApi
  ) => {
    const response = await SessionsService.addNode({
      requestBody: arg.node,
      sessionId: arg.sessionId,
    });

    return response;
  }
);

/**
 * `SessionsService.invokeSession()` thunk
 */
export const sessionInvoked = createAppAsyncThunk(
  'api/sessionInvoked',
  async (arg: { sessionId: string }, _thunkApi) => {
    const { sessionId } = arg;

    const response = await SessionsService.invokeSession({
      sessionId,
      all: true,
    });

    return response;
  }
);

type SessionCanceledArg = Parameters<
  (typeof SessionsService)['cancelSessionInvoke']
>[0];

/**
 * `SessionsService.cancelSession()` thunk
 */
export const sessionCanceled = createAppAsyncThunk(
  'api/sessionCanceled',
  async (arg: SessionCanceledArg, _thunkApi) => {
    const { sessionId } = arg;

    const response = await SessionsService.cancelSessionInvoke({
      sessionId,
    });

    return response;
  }
);

type SessionsListedArg = Parameters<
  (typeof SessionsService)['listSessions']
>[0];

/**
 * `SessionsService.listSessions()` thunk
 */
export const listedSessions = createAppAsyncThunk(
  'api/listSessions',
  async (arg: SessionsListedArg, _thunkApi) => {
    const response = await SessionsService.listSessions(arg);

    return response;
  }
);
