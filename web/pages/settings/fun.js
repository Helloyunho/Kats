import React from 'react'
import Base from '../base'
import Axios from 'axios'
import { Checkbox, Grid, Header, Divider, Container, Input, Button } from 'semantic-ui-react'

class Fun extends React.Component {
  static getInitialProps ({ query: datas }) {
    return { datas }
  }

  constructor (props) {
    super(props)
    this.state = {
      enabled: this.props.datas.enabled,
      message: this.props.datas.levelUpMessage,
      success: false
    }
  }

  onChangeCommand = async (_, { value, checked }) => {
    if (checked) {
      this.setState({ enabled: (await Axios(`/command/enable/${value}?guildid=${this.props.datas.guildid}`)).data })
    } else {
      this.setState({ enabled: (await Axios(`/command/disable/${value}?guildid=${this.props.datas.guildid}`)).data })
    }
  }

  onChangeMessage = async (_, { value }) => {
    this.setState({
      message: value
    })
  }

  onClickMessage = async () => {
    let response = (await Axios.post('/command/level/message', {
          message: this.state.message,
          guildid: this.props.datas.guildid
        }))
    if (response.status === 200 && response.data === this.state.message) {
      this.setState({ success: true })
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
              <Header as='h2'>Anhae</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='anhae' onChange={this.onChangeCommand} checked={this.state.enabled.includes('anhae')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>Anhae!(from FGcounter)</Header>
          <Grid>
            <Grid.Column width={15}>
              <Header as='h2'>Music</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='music' onChange={this.onChangeCommand} checked={this.state.enabled.includes('music')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>Listen some songs from youtube! YAY</Header>
          <Grid>
            <Grid.Column width={15}>
              <Header as='h2'>Level</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='level' onChange={this.onChangeCommand} checked={this.state.enabled.includes('level')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>You can get 15~25 exp per a message! Who'll be the winner?</Header>
          <Divider hidden />
          <Header as='h4'>Level up message</Header>
          <Header as='h5'>You can mention the level up-ed user to use {'{user}'} and get current level to use {'{level}'}</Header>
          <Input fluid
            placeholder='Type Level up message on Here...'
            action={<Button positive onClick={this.onClickMessage}>{this.state.success ? 'Saved!' : 'Save'}</Button>}
            onChange={this.onChangeMessage}
            value={this.state.message}
          />
        </Container>
      </React.Fragment>
    )
  }
}

export default Fun
