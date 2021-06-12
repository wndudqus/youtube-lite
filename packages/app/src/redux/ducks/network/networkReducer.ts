import { nanoid } from "nanoid"
import { MarkRequired } from "ts-essentials"

enum APIStatus {
  /**
   * @description when the request has been first made
   * and the actual network request has not been started
   */
  NOT_STARTED = `NOT_STARTED`,
  LOADING = `LOADING`,
  SUCCESS = `SUCCESS`,
  FAILURE = `FAILURE`,
  CANCELLED = `CANCELLED`,
}

type APIMeta<RequesName extends string, Err = Error> = {
  /**
   * @description the unique id of a request.
   * Many requests can have the same name, but not the same id.
   */
  id: ReturnType<typeof nanoid>
  status: APIStatus
  /**
   * @description error will be stored here once it happens
   */
  error?: Err
  /**
   * @description The name of a specific request.
   * @example `DELETE_USER`
   * @warning a request name should be unique across your application.
   */
  name: RequesName
  /**
   * time at which each action of the request took place
   */
  timestamp: {
    [APIStatus.NOT_STARTED]?: number
    [APIStatus.LOADING]?: number
    [APIStatus.SUCCESS]?: number
    [APIStatus.FAILURE]?: number
    [APIStatus.CANCELLED]?: number
  }
}

enum RequestActions {
  CREATE = `CREATE`,
  START = `START`,
  SUCCEED = `SUCCEED`,
  FAIL = `FAIL`,
  CANCEL = `CANCEL`,
  /**
   * @description used to remove the request from reducer.
   */
  REMOVE = `REMOVE`,
}

const REDUX_ASYNC_PREFIX = `@RA` as const

export type ActionTypeCreator<
  RequestAction extends RequestActions,
  RequestName extends string
> = `${typeof REDUX_ASYNC_PREFIX}/${RequestAction}/${RequestName}`

const networkActionTypeCreator: <
  RequestAction extends RequestActions,
  RequestName extends string
>(
  requestAction: RequestAction,
  name: RequestName
) => ActionTypeCreator<RequestAction, RequestName> = (requestAction, name) =>
  `${REDUX_ASYNC_PREFIX}/${requestAction}/${name}`

type CreateRequestParams<RequestName extends string, Payload = never> = Pick<
  APIMeta<RequestName>,
  `name`
> &
  Partial<Pick<APIMeta<RequestName>, `id`>> & {
    payload?: Payload | undefined
  }

type CreateRequestReturns<RequestName extends string, Payload = never> = Pick<
  APIMeta<RequestName>,
  `id` | `name`
> & {
  payload?: Payload | undefined
}

/**
 * Sometimes you want to create a request in some time before in advance to sending the actual request.
 * Use this to create a request first, and use {@link startRequest} to fire the actual request.
 *
 * If you want to immediately fire a request upon creating it, use {@link startRequest} directly instead.
 */
export function createRequest<RequestName extends string, Payload = never>({
  id = nanoid(),
  name,
  payload,
}: CreateRequestParams<RequestName, Payload>): CreateRequestReturns<
  RequestName,
  Payload
> & {
  type: ActionTypeCreator<typeof RequestActions.CREATE, RequestName>
} {
  return {
    id,
    name,
    payload,
    type: networkActionTypeCreator(RequestActions.CREATE, name),
  }
}

/**
 * if you just want to start request right away without {@link createRequest},
 * use this. Perhaps this is the most common action to use it you don't create a request in advance.
 *
 * @warning if a new id is supplied and the request information has been already initiated with {@link createRequest},
 * it will ignore the new id and proceed with the existing id.
 */
export function startRequest<RequestName extends string, Payload = never>({
  id = nanoid(),
  name,
  payload,
}: CreateRequestParams<RequestName, Payload>): CreateRequestReturns<
  RequestName,
  Payload
> & {
  type: ActionTypeCreator<typeof RequestActions.START, RequestName>
} {
  return {
    id,
    name,
    payload,
    type: networkActionTypeCreator(RequestActions.START, name),
  }
}

export type GeneralRequestActionCreator<RequestAction extends RequestActions> =
  <RequestName extends string, Payload = never>(
    params: MarkRequired<CreateRequestParams<RequestName, Payload>, `id`>
  ) => CreateRequestReturns<RequestName, Payload> & {
    type: ActionTypeCreator<RequestAction, RequestName>
  }

/**
 * @description call this action when request is successful
 */
export const succeedRequest: GeneralRequestActionCreator<RequestActions.SUCCEED> =
  (params) => ({
    ...params,
    type: networkActionTypeCreator(RequestActions.SUCCEED, params.name),
  })

/**
 * @param params.payload insert error object in payload
 */
export const failRequest: GeneralRequestActionCreator<RequestActions.FAIL> = (
  params
) => ({
  ...params,
  type: networkActionTypeCreator(RequestActions.FAIL, params.name),
})

/**
 *
 * @param params
 */
export const cancelRequest: GeneralRequestActionCreator<RequestActions.CANCEL> =
  (params) => ({
    ...params,
    type: networkActionTypeCreator(RequestActions.CANCEL, params.name),
  })

// export function succeedRequest<RequestName extends string, Payload = never>(
//   params: MarkRequired<CreateRequestParams<RequestName, Payload>, `id`>
// ): CreateRequestReturns<RequestName, Payload> & {
//   type: ActionTypeCreator<typeof RequestActions.SUCCEED, RequestName>
// } {
//   return {
//     ...params,
//     type: networkActionTypeCreator(RequestActions.SUCCEED, params.name),
//   }
// }

// export function createAndStartRequest<
//   RequestName extends string,
//   Payload = never
// >(params: Parameters<typeof createRequest>[0]) {
//   const request = createRequest<RequestName, Payload>(params);
// }
// export function createAndStartRequest<RequestName extends string, Payload = never>(params: Parameters<typeof createRequest>):

// export function startRequest<RequestName extends string, Payload = never>({

// }):
// const initialState: {
//   requests: Record<string,
// } = {

// }

// export const networkReducer = (state = initialState, action) {
//   // The reducer normally looks at the action type field to decide what happens
//   switch (action.type) {
//     // Do something here based on the different types of actions
//     default:
//       // If this reducer doesn't recognize the action type, or doesn't
//       // care about this specific action, return the existing state unchanged
//       return state
//   }
// }
