import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

export default defineBoot(({ app }) => {
  const token = localStorage.getItem('kdc_token')

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }
})

export { api }
