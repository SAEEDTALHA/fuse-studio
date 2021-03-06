import { createSelector } from 'reselect'
import { getAddresses, getCurrentNetworkType } from 'selectors/network'
import { initialAccount } from 'reducers/accounts'
const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

export const getAccountAddress = state => state.network.accountAddress

export const getAccount = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || initialAccount
)

export const getProviderInfo = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => (accounts[accountAddress] && accounts[accountAddress].providerInfo) || {}
)

export const getCommunitiesKeys = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => (accounts[accountAddress] && accounts[accountAddress].communities) || []
)

export const getFunderAccount = createSelector(
  state => state.accounts,
  (accounts) => (accounts && accounts[funderAddress]) || null
)

export const getUser3boxData = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => {
    if (accounts[accountAddress] && (accounts[accountAddress].publicData || accounts[accountAddress].privateData)) {
      return {
        publicData: accounts[accountAddress].publicData,
        privateData: accounts[accountAddress].privateData
      }
    }
    return { publicData: {}, privateData: {} }
  }
)

export const getBalances = createSelector(
  getAccount,
  (account) => account.balances || {}
)

export const getAccountTokens = createSelector(
  state => state.entities.tokens,
  getAccount,
  (tokens, account) => account.tokens.map(token => tokens[token] || {})
)

export const getFuseBalance = createSelector(
  getCurrentNetworkType,
  getAddresses,
  getAccount,
  (network, addresses, account) => network === 'fuse'
    ? account.balanceOfNative
    : addresses ? account.balances[addresses.FuseToken] : undefined
)
