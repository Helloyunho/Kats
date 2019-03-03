/* eslint-disable */
// Delete this and top commant
import React from 'react'
import Base from '../base'
import Axios from 'axios'
import { Checkbox, Grid, Header, Divider, Container } from 'semantic-ui-react'

class CHANGE extends React.Component {
  static getInitialProps ({ query: datas }) {
    return { datas }
  }

  constructor (props) {
    super(props)
    this.state = {enabled: this.props.datas.enabled}
  }

  onChangeCommand = async (_, {value, checked}) => {
    if (checked) {
      this.setState({enabled: (await Axios(`/command/enable/${value}?guildid=${this.props.datas.guildid}`)).data})
    } else {
      this.setState({enabled: (await Axios(`/command/disable/${value}?guildid=${this.props.datas.guildid}`)).data})
    }
  }

  render () {
    return (
      <React.Fragment>
        <Base datas={this.props.datas} />
        <Divider hidden />
        <Container>
          <Grid>
            <Grid.Column width={15}>
              <Header as='h2'>Command</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='commandCodename' onChange={this.onChangeCommand} checked={this.state.enabled.includes('commandCodename')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>Command description</Header>
        </Container>
      </React.Fragment>
    )
  }
}

export default CHANGE
