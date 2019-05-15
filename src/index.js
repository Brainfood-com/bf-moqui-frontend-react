import React from 'react'
import CancelablePromise from 'cancelable-promise'

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
    moquiBase.then(moquiBase => {
      const {headers = {}} = options
      return fetch(moquiBase + path, {
        ...options,
        headers: {
          ...headers,
          moquiSessionToken,
        },
        mode: 'cors',
        credentials: 'include',
      })
    }).then(resolve, reject)
  }).then(response => {
      moquiSessionToken = response.headers.get('moquiSessionToken')
      return response.json()
    })
  })
}

export function withModelApi(options = {}) {
  const {extractKey, fetchModel, processModel} = options

  return Component => {
    return class ModelApiWrapper extends React.Component {
      state = {
        isLoading: true,
      }

      static getDerivedStateFromProps(props, state) {
        const key = extractKey(props)
        if (isEqual(key, state.key)) {
          return {}
        }
        return {key, model: undefined}
      }

      componentDidMount() {
        this.loadModel()
      }

      componentWillUnmount() {
        if (this._pipeline) {
          this._pipeline.cancel()
        }
      }

      loadModel() {
        this.setState((state, props) => {
          if ((state.isLoading && this._pipeline) || state.model !== undefined) {
            return
          }
          const {key} = state
          const clearPipeline = () => delete this._pipeline
          this._pipeline = fetchModel(key).then(processModel).then(model => {
            this.setState((state, props) => {
              if (key === state.key) {
                return {isLoading: false, model}
              }
            })
          }).then(clearPipeline, clearPipeline)
          return {isLoading: true}
        })
      }

      componentDidUpdate() {
        if (state.model === undefined) {
          this.loadModel()
        }
      }

      refreshModel = () => {
        this.setState((state, props) => {
          this.loadModel()
          return {model: undefined}
        })
      }

      render() {
        const {key, model, isLoading} = this.state
        return <Component {...this.props} {...model} isLoading={isLoading}/>
      }
    }
  }
}
