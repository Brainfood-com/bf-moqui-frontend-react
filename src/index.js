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

export function moquiApi(path, options = {}) {
  let currentMoquiToken
  function applyMoquiToken([moquiBase, moquiToken]) {
    if (moquiToken === currentMoquiToken) {
      return moquiBase
    }
    console.log('moquiToken', moquiToken)
    return fetch(moquiBase + '/bf-auth/connect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        authorization: moquiToken,
      }),
      mode: 'cors',
      credentials: 'include',
    }).then(response => moquiBase)
  }
  return new CancelablePromise((resolve, reject) => {
    Promise.all([moquiBase, Auth.getToken('moqui')]).then(applyMoquiToken).then(moquiBase => {
      const {headers = {}} = options
      return fetch(moquiBase + path, {
        ...options,
        headers: {
          ...headers,
        },
        mode: 'cors',
        credentials: 'include',
      })
    }).then(resolve, reject)
  }).then(response => response.json())
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
