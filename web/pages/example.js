/* eslint-disable */
// Delete this and top commant
import React from 'react'
import Base from './base'

class CHANGE extends React.Component {
  static getInitialProps ({ query: datas }) {
    return { datas }
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <React.Fragment>
        <Base datas={this.props.datas} />
      </React.Fragment>
    )
  }
}

export default CHANGE
