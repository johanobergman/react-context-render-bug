import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import PropTypes from 'prop-types'

let deepChild = null

class App extends React.Component {
  static childContextTypes = {}

  updateAppAndDeepChild = () => {
    // The deeply nested child <DeepChild /> will receive a force update.
    // We'll also trigger an update from App, but this should be blocked
    // at <Blocker />.
    // Despite this, <LoggerWhichShouldNotUpdate />, which is a direct
    // child of <Blocker /> still get's updated - but only as long as
    // <DeepChild /> is updated within the same tick and <App />
    // defines childContextTypes.
    this.forceUpdate()
    deepChild.forceUpdate()
  }

  render() {
    return (
      <div>
        <button onClick={this.updateAppAndDeepChild}>
          Force update &lt;App /&gt; and &lt;DeepChild /&gt;
        </button>
        <Blocker>
          <LoggerWhichShouldNotUpdate>
            <DeepChild />
          </LoggerWhichShouldNotUpdate>
        </Blocker>
      </div>
    )
  }
}

class Blocker extends React.Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return this.props.children
  }
}

class LoggerWhichShouldNotUpdate extends React.Component {
  timesRenderCalled = 0

  componentWillReceiveProps(nextProps) {
    // Does not get called
    console.log('LoggerWhichShouldNotUpdate#willReceiveProps')
  }

  componentWillUpdate() {
    // Gets called
    console.log('LoggerWhichShouldNotUpdate#willUpdate')
  }

  render() {
    // Called despite parent being a Blocker
    console.log('LoggerWhichShouldNotUpdate#render')
    return (
      <div style={{ border: '2px solid #eee', padding: 10 }}>
        &lt;LoggerWhichShouldNotUpdate /&gt;, blocked by parent
        shouldComponentUpdate, render called {this.timesRenderCalled++} times
        {this.props.children}
      </div>
    )
  }
}

class DeepChild extends React.Component {
  timesRenderCalled = 0

  componentDidMount() {
    deepChild = this
  }

  render() {
    return (
      <div style={{ border: '2px solid #eee', padding: 10 }}>
        &lt;DeepChild /&gt;, render called {this.timesRenderCalled++} times
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
