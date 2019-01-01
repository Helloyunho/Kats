import React from 'react'
import Base from './base'
import { Container, Image } from 'semantic-ui-react'

class Guilds extends React.Component {
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
        <Container>
          {this.props.datas.guilds.map(x => {
            return (<Image src={`https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png`} circular content={x.name} />)
          })}
        </Container>
      </React.Fragment>
    )
  }
}

export default Guilds
