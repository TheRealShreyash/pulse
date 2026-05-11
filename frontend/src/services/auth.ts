import { BACKEND_URL } from '#/config'

export const redirectToIrisLogin = () => {
  window.location.href = `${BACKEND_URL}/api/auth/iris-login`
}

export const redirectToIrisSignup = () => {
  window.location.href = `${BACKEND_URL}/api/auth/iris-signup`
}
