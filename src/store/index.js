import Web3 from 'web3'

export const state = () => ({
    web3Instance: {},
})

export const mutations = {
    async registerWeb3Instance(state, payload) {
        // Save Web3 instance
        state.web3Instance.eth = payload.eth
        state.web3Instance.utils = payload.utils
        // Save current account
        const accounts = await state.web3Instance.eth.getAccounts()
        state.web3Instance.currentAccount = accounts[0]
    }
}

export const actions = {
    registerWeb3( { commit }, web3) {
        const instance = new Web3(web3.currentProvider)        
        commit('registerWeb3Instance', instance)
    }
}

export const getters = {}


