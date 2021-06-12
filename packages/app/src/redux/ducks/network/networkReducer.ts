import { nanoid } from "nanoid"

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
  CREATE_AND_START = `CREATE_AND_START`,
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

/**
 * Sometimes you want to create a request in some time before in advance to sending the actual request.
 * Use this to create a request first, and use {@link startRequest} to fire the actual request.
 *
 * If you want to immediately fire a request upon creating it, use {@link createAndStartRequest} directly instead.
 */
export function createRequest<RequestName extends string, Payload = never>({
  id = nanoid(),
  name,
  payload,
}: Pick<APIMeta<RequestName>, `name`> &
  Partial<Pick<APIMeta<RequestName>, `id`>> & {
    payload?: Payload | undefined
  }): Pick<APIMeta<RequestName>, `id` | `name`> & {
  payload?: Payload | undefined
  type: ActionTypeCreator<typeof RequestActions.CREATE, RequestName>
} {
  return {
    id,
    name,
    payload,
    type: `${REDUX_ASYNC_PREFIX}/${RequestActions.CREATE}/${name}`,
  }
}

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
