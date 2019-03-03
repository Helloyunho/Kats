import React from 'react'
import Base from './base'
import Link from 'next/link'
import { Container, Image, Divider, Header, Grid, Dropdown } from 'semantic-ui-react'

class Guilds extends React.Component {
  static getInitialProps ({ query: datas }) {
    return {datas}
  }

  constructor (props) {
    super(props)
    this.state = {
      loadingForDash: false
    }
  }

  onSelectedGuild = (_, guild) => {
    this.setState({
      loadingForDash: true
    })
    if (typeof window !== 'undefined') {
      window.location = `/dashboard?guildid=${guild.value}`
    }
  }

  render () {
    return (
      <React.Fragment>
        <Base datas={this.props.datas} />
        <Divider hidden />
        <Container>
          <Grid centered columns={1}>
            <Grid.Column width={12}>
              <Header as='h2'>Select your server to go to dashboard!</Header>
              <Dropdown placeholder='Select your server!' loading={this.state.loadingForDash} disabled={this.state.loadingForDash} fluid selection options={
                this.props.datas.guilds.map(guild => {
                  return {key: guild.id, text: guild.name, value: guild.id}
                })
              } onChange={this.onSelectedGuild} />
            </Grid.Column>
          </Grid>
        </Container>
      </React.Fragment>
    )
  }
}

export default Guilds
