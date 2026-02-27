import { defineStore } from "pinia"

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAdmin: false,
    isLogin: false,
    username: ''
  }),
  actions: {
    setIsAdmin(value) {
      this.isAdmin = value
    },
    setIsLogin(value) {
      this.isLogin = value
    },
    setUserName(value) {
      this.username = value
    }
  }
})