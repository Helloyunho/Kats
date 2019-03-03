import React from 'react'
import 'semantic-ui-css/semantic.min.css'
import Link from 'next/link'
import { Menu, Container, Icon, Dropdown, Image } from 'semantic-ui-react'

const styles = {
}

class Base extends React.Component {
  constructor (props) {
    super(props)
    this.state = {anchorEl: null}
  }

  render () {
    return (
      <React.Fragment>
        <Menu attached='top' stackable>
          <Container>
            <Link as='/' passHref>
              <Menu.Item
                name='home'
                as='a'
                onClick={this.OnHomeButtonClick}>
                <Icon name='home' /> Home
              </Menu.Item>
            </Link>
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
                    <Link as='/guilds' passHref>
                      <Dropdown.Item onClick={this.OnServerButtonClick}>
                        Servers
                      </Dropdown.Item>
                    </Link>
                    <Link as='/logout' passHref>
                      <Dropdown.Item onClick={this.OnLogoutButtonClick}>
                        Logout
                      </Dropdown.Item>
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link as='/login' passHref>
                  <Menu.Item
                    name='login'
                    as='a'
                    onClick={this.OnLoginButtonClick}>
                    <Icon name='sign in' /> Login
                  </Menu.Item>
                </Link>
              )}
            </Menu.Menu>
          </Container>
        </Menu>
      </React.Fragment>
    )
  }
}

export default Base
