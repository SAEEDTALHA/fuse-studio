import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import { fetchCommunity, fetchTokenProgress } from 'actions/token'
import { isUserExists } from 'actions/user'
import { loadModal } from 'actions/ui'
import { Route, Switch } from 'react-router-dom'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import Header from 'components/dashboard/components/Header'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { getForeignNetwork, getBridgeStatus } from 'selectors/network'
import NavBar from 'components/common/NavBar'
import { getAccountAddress, getBalances } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'
import { getToken } from 'selectors/dashboard'
import { fetchEntities } from 'actions/communityEntities'
import SignIn from 'components/common/SignIn'
import { changeNetwork } from 'actions/network'

class DashboardLayout extends PureComponent {
  state = {
    open: false
  }

  componentDidMount () {
    const { token } = this.props
    if (!token) {
      const { fetchCommunity, fetchTokenProgress, fetchEntities, communityAddress } = this.props
      fetchCommunity(communityAddress)
      fetchTokenProgress(communityAddress)
      fetchEntities(communityAddress)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onSetSidebarOpen(false)
    }

    if (this.props.match.params.address !== prevProps.match.params.address) {
      const { communityAddress, fetchCommunity, fetchTokenProgress, fetchEntities } = this.props
      fetchCommunity(communityAddress)
      fetchTokenProgress(communityAddress)
      fetchEntities(communityAddress)
    }
  }

  onlyOnFuse = (successFunc) => {
    const { networkType, isPortis } = this.props
    if (networkType === 'fuse') {
      successFunc()
    } else if (isPortis) {
      const { changeNetwork } = this.props
      changeNetwork('fuse')
      successFunc()
    } else {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['fuse'] })
    }
  }

  onSetSidebarOpen = open => this.setState({ open })

  render () {
    if (!this.props.token) {
      return null
    }
    const { open } = this.state
    const { match, token, community, metadata, networkType, communityAddress, accountAddress, isAdmin } = this.props

    const { address: tokenAddress, name } = token
    const { isClosed } = community
    return (
      <div className='dashboard'>
        {accountAddress ? <SignIn accountAddress={accountAddress} /> : undefined}
        <div className='container'>
          {
            !isMobile
              ? <SidebarContent isAdmin={isAdmin} isGradientLogo communityName={token && token.name} match={match.url} />
              : <Sidebar
                sidebar={
                  <SidebarContent isAdmin={isAdmin} isGradientLogo communityName={token && token.name} match={match.url} />
                }
                open={open}
                styles={{
                  sidebar: { zIndex: 101 },
                  overlay: { zIndex: 100 }
                }}
                onSetOpen={this.onSetSidebarOpen}
              >
                {!open && <div className='hamburger' onClick={() => this.onSetSidebarOpen(true)}><FontAwesome name='bars' /></div>}
              </Sidebar>
          }
          <div className='content__container'>
            <NavBar withLogo={false} />
            <div className='content'>
              <Header
                metadata={metadata[token.tokenURI] || {}}
                tokenAddress={tokenAddress}
                isClosed={isClosed}
                name={name}
                networkType={networkType}
                token={token}
              />
              <Switch>
                <Route exact path={`${match.url}`} render={() => <Dashboard onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/merchants`} render={() => <Businesses onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/users`} render={() => <Users onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/wallet`} render={() => <WhiteLabelWallet value={communityAddress} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route path={`${match.url}/transfer/:sendTo?`} render={() => <TransferPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                {
                  isAdmin && (
                    <Fragment>
                      <Route exact path={`${match.url}/mintBurn`} render={() => <MintBurnPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                    </Fragment>
                  )
                }
              </Switch>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: getAccountAddress(state),
  networkType: state.network.networkType,
  token: getToken(state, match.params.address),
  isPortis: state.network.isPortis,
  community: state.entities.communities && state.entities.communities[match.params.address],
  communityAddress: match.params.address,
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  balances: getBalances(state),
  bridgeStatus: getBridgeStatus(state),
  dashboard: state.screens.dashboard,
  homeTokenAddress: state.entities.bridges[match.params.address] && state.entities.bridges[match.params.address].homeTokenAddress
})

const mapDispatchToProps = {
  fetchCommunity,
  fetchTokenProgress,
  isUserExists,
  loadModal,
  fetchEntities,
  changeNetwork
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)