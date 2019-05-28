import isEqual from 'lodash/isEqual'
import React from 'react'
import CancelablePromise from 'cancelable-promise'
import Auth from 'bf-auth-frontend-react'

export const [moquiBase, setMoquiBase] = (() => {
  let moquiBaseResolve
	const moquiBasePromise = new Promise((resolve, reject) => {
    moquiBaseResolve = resolve
  })
  return [moquiBasePromise, moquiBaseResolve]
})()

let moquiSessionToken = undefined
export function moquiApi(path, options = {}) {
  return new CancelablePromise((resolve, reject) => {
    moquiBase.then(moquiBase => Auth.getProviderToken('moqui').then(authorization => {
      const {headers = {}} = options
      return fetch(moquiBase + path, {
        ...options,
        headers: {
          ...headers,
          authorization,
          moquiSessionToken,
        },
        mode: 'cors',
        credentials: 'include',
      })
    })).then(resolve, reject)
  }).then(response => {
    moquiSessionToken = response.headers.get('moquiSessionToken')
    return response.json()
  })
}

export function withModelApi(options = {}) {
  const {extractKey, fetchModel, processModel} = options

  return Component => {
    return function ModelApiWrapper(props) {
      const [key, setKey] = React.useState(undefined)
      const [model, setModel] = React.useState(null)
      const [isLoading, setIsLoading] = React.useState(true)
      const [pipeline, setPipeline] = React.useState(null)

      const newKey = extractKey(props)
      if (!isEqual(key, newKey)) {
        setKey(newKey)
        if (pipeline) {
          pipeline.cancel()
        }
        if (newKey !== undefined) {
          if (!isLoading) {
            setIsLoading(true)
          }
          setPipeline(fetchModel(newKey).then(processModel).then(setModel).then(() => setIsLoading(false), () => setIsLoading(false)))
        } else {
          setPipeline(null)
        }
      }

      return <Component {...props} {...model} isLoading={isLoading}/>
    }
  }
}
