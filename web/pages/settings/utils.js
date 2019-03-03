import React from 'react'
import Base from '../base'
import Axios from 'axios'
import { Checkbox, Grid, Header, Divider, Container, Dropdown, Input, Button } from 'semantic-ui-react'

class Utils extends React.Component {
  static getInitialProps ({ query: datas }) {
    return { datas }
  }

  constructor (props) {
    super(props)
    this.state = {
      enabled: this.props.datas.enabled,
      message: this.props.datas.welcomeMessage,
      channel: this.props.datas.welcomeChannel,
      successSaveMessage: false,
      successSaveChannel: false
    }
  }

  onChangeCommand = async (_, {value, checked}) => {
    if (checked) {
      this.setState({enabled: (await Axios(`/command/enable/${value}?guildid=${this.props.datas.guildid}`)).data})
    } else {
      this.setState({enabled: (await Axios(`/command/disable/${value}?guildid=${this.props.datas.guildid}`)).data})
    }
  }

  onChangeMessage = async (_, { value }) => {
    this.setState({
      message: value
    })
  }

  onClickMessage = async () => {
    let response = (await Axios.post('/command/welcome/message', {
          message: this.state.message,
          guildid: this.props.datas.guildid
        }))
    if (response.status === 200 && response.data === this.state.message) {
      this.setState({ successSaveMessage: true })
    }
  }

  onChangeChannel = async (_, { value }) => {
    console.log(value)
    let response = (await Axios.post('/command/welcome/channel', {
          channel: value,
          guildid: this.props.datas.guildid
        }))
    if (response.status === 200 && response.data === value) {
      this.setState({ successSaveChannel: true, channel: response.data })
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
              <Header as='h2'>Encrypt / Decrypt</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='enDecrypt' onChange={this.onChangeCommand} checked={this.state.enabled.includes('enDecrypt')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>You can encrypt something and decrypt also.</Header>
          <Grid>
            <Grid.Column width={15}>
              <Header as='h2'>Welcome</Header>
            </Grid.Column>
            <Grid.Column>
              <Checkbox toggle value='welcome' onChange={this.onChangeCommand} checked={this.state.enabled.includes('welcome')} />
            </Grid.Column>
          </Grid>
          <Header as='h4'>Kats will send an nice message when a user has came to the server.</Header>
          <Divider hidden />
          <Header as='h4'>Welcome message</Header>
          <Header as='h5'>You can mention the user that just came to use {'{user}'} and get server name to use {'{server_name}'}</Header>
          <Input fluid
            placeholder='Type Welcome message on Here...'
            action={<Button positive onClick={this.onClickMessage}>{this.state.successSaveMessage ? 'Saved!' : 'Save'}</Button>}
            onChange={this.onChangeMessage}
            value={this.state.message}
          />
          <Divider hidden />
          <Header as='h4'>Welcome channel {this.state.successSaveChannel ? 'Saved!' : ''}</Header>
          <Dropdown placeholder='Select welcome channel' value={this.state.channel} fluid selection options={
              this.props.datas.channels.map(channel => {
                return {key: channel.id, text: channel.name, value: channel.id}
              })
            } onChange={this.onChangeChannel} />
        </Container>
      </React.Fragment>
    )
  }
}

export default Utils
