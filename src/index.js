export const [moquiBase, setMoquiBase] = (() => {
  let moquiBaseResolve
	const moquiBasePromise = new Promise((resolve, reject) => {
    moquiBaseResolve = resolve
  })
  return [moquiBasePromise, moquiBaseResolve]
})()

let moquiSessionToken = undefined
export function moquiApi(path, options = {}) {
  return moquiBase.then(moquiBase => {
    const {headers = {}} = options
    return fetch(moquiBase + path, {
      ...options,
      headers: {
        ...headers,
        moquiSessionToken,
      },
      mode: 'cors',
      credentials: 'include',
    }).then(response => {
      moquiSessionToken = response.headers.get('moquiSessionToken')
      return response.json()
    })
  })
}
