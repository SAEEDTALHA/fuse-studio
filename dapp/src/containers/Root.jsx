import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import Oven from 'components/oven/Oven'
import IssuanceWizard from 'components/issuance/IssuanceWizard'
import DashboardLayout from 'components/dashboard/containers/MainDashboard'
import MobileProvider from 'containers/MobileProvider'
import SignInProvider from 'containers/SignInProvider'
// import withTracker from 'containers/withTracker'
import Web3, { withNetwork } from 'containers/Web3'
import Layout from 'components/common/Layout'
import HomePage from 'components/home/pages/HomePage'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Footer from 'components/common/Footer'

export default class Root extends Component {
  render () {
    const { store, history } = this.props

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <BrowserRouter>
            <Layout>
              {!history.location.pathname.includes('/join') && !history.location.pathname.includes('/sign')
                ? <Web3 /> : undefined}
              <Switch>
                <Route exact path='/' component={withNetwork(HomePage)} />
                <Route path='/view/issuance' component={withNetwork(IssuanceWizard)} />
                <Route path='/view/communities' component={withNetwork(Oven)} />
                <Route path='/view/community/:address' component={withNetwork(DashboardLayout)} />
                <Route path='/view/sign/:isMobileApp?' component={SignInProvider} />
                <Route path='/view/join/:address' component={MobileProvider} />
              </Switch>
              <Footer />
            </Layout>
          </BrowserRouter>
        </ConnectedRouter>
      </Provider>)
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}