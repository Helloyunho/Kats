import React from 'react'
import Router from 'next/router'
import 'semantic-ui-css/semantic.min.css'
import { Menu, Container, Icon, Dropdown, Image } from 'semantic-ui-react'

const styles = {
}

class Base extends React.Component {
  constructor (props) {
    super(props)
    this.state = {anchorEl: null}
  }

  OnLoginButtonClick = () => {
    Router.push({
      pathname: '/login'
    })
  }

  OnServerButtonClick = () => {
    Router.push({
      pathname: '/guilds'
    })
  }

  OnHomeButtonClick = () => {
    Router.push({
      pathname: '/'
    })
  }

  render () {
    return (
      <React.Fragment>
        <Menu attached='top' stackable>
          <Container>
            <Menu.Item
              name='home'
              as='a'
              onClick={this.OnHomeButtonClick}>
              <Icon name='home' /> Home
            </Menu.Item>
            <Menu.Menu position='right'>
              {typeof this.props.datas.user !== 'undefined' ? (
                <Dropdown item trigger={(
                  <span>
                    <Image src={!this.props.datas.user.avatar
                      ? `https://cdn.discordapp.com/embed/avatars/${this.props.datas.user.discriminator}.png`
                      : (this.props.datas.user.avatar.startsWith('a_')
                        ? `https://cdn.discordapp.com/avatars/${this.props.datas.user.id}/${this.props.datas.user.avatar}.gif`
                        : `https://cdn.discordapp.com/avatars/${this.props.datas.user.id}/${this.props.datas.user.avatar}.png`)} avatar />
                    {this.props.datas.user.username}
                  </span>
                  )} pointing>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={this.OnServerButtonClick}>
                      Servers
                    </Dropdown.Item>
                    <Dropdown.Item>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Menu.Item
                  name='login'
                  as='a'
                  onClick={this.OnLoginButtonClick}>
                  <Icon name='sign in' /> Login
                </Menu.Item>
              )}
            </Menu.Menu>
          </Container>
        </Menu>
      </React.Fragment>
    )
  }
}

export default Base
