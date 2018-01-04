import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Simulate } from 'react-dom/test-utils'

it('respects shouldComponentUpdate on simultaneous updates while using context', () => {
  let app = null
  let deepChild = null
  let shouldNotUpdateRenderCount = 0

  class App extends React.Component {
    static childContextTypes = {}

    getChildContext() {
      return {}
    }

    updateSelfAndChild = () => {
      this.forceUpdate()
      deepChild.forceUpdate()
    }

    render() {
      return (
        <div onClick={this.updateSelfAndChild} ref={e => (this.div = e)}>
          <Blocker>
            <ShouldNotUpdate>
              <DeepChild />
            </ShouldNotUpdate>
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

  class ShouldNotUpdate extends React.Component {
    render() {
      shouldNotUpdateRenderCount++
      return this.props.children
    }
  }

  class DeepChild extends React.Component {
    componentDidMount() {
      deepChild = this
    }

    render() {
      return null
    }
  }

  const div = document.createElement('div')
  const instance = ReactDOM.render(<App />, div)
  expect(shouldNotUpdateRenderCount).toEqual(1)

  instance.updateSelfAndChild()
  expect(shouldNotUpdateRenderCount).toEqual(1)

  Simulate.click(instance.div)
  expect(shouldNotUpdateRenderCount).toEqual(1)

  ReactDOM.unmountComponentAtNode(div)
})
