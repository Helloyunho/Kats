import React from 'react'
import Base from './base'

class Index extends React.Component {
  static getInitialProps ({ query: datas }) {
    return {datas}
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

export default Index
