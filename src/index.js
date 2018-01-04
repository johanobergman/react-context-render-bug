import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import PropTypes from 'prop-types'

class App extends React.Component {
  broadcast = null

  static contextTypes = {
    broadcast: PropTypes.object,
  }

  static childContextTypes = {
    broadcast: PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      broadcast: this.broadcast,
    }
  }

  componentWillMount() {
    this.broadcast = {
      // Will be set by the <Listener /> child,
      // would be an array in reality.
      listener: null,
    }
  }

  notifyChild = () => {
    // The deeply nested child <Listener /> will receive a call
    // which will cause it to update its state.
    // We'll also trigger an update from App, but this should be blocked
    // by <Blocker />.
    // Despite this, <LoggerWhichShouldNotUpdate />, which is a direct
    // child of <Blocker /> still get's updated - but only if the listener
    // below is called so that <Listener /> updates itself.
    this.forceUpdate()
    this.broadcast.listener(Math.random())
  }

  render() {
    return (
      <div>
        <button onClick={this.notifyChild}>
          Notify &lt;Listener /&gt; with new number
        </button>
        <Blocker>
          <LoggerWhichShouldNotUpdate>
            <Listener />
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
        shouldComponentUpdate. Render called {this.timesRenderCalled++} times
        {this.props.children}
      </div>
    )
  }
}

class Listener extends React.Component {
  static contextTypes = {
    broadcast: PropTypes.object.isRequired,
  }

  state = {
    number: 1,
  }

  componentDidMount() {
    this.context.broadcast.listener = number => {
      this.setState({ number })
    }
  }

  render() {
    return (
      <div style={{ border: '2px solid #eee', padding: 10 }}>
        &lt;Listener /&gt; number via context injected listener:{' '}
        {this.state.number}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
