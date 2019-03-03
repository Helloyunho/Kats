import React from 'react'
import Base from './base'
import { Container, Divider, Header, Grid, Dropdown, Card, Form, Checkbox } from 'semantic-ui-react'
import Link from 'next/link'
import Infos from './settings'
import Axios from 'axios'

class DashBoard extends React.Component {
  static getInitialProps ({ query: datas }) {
    return {datas}
  }

  constructor (props) {
    super(props)
    delete Infos.__route
    this.state = { lang: this.props.datas.lang }
  }

  onClickLangChange = async (_, { value }) => {
    if (value === 'ko') {
      this.setState({ lang: (await Axios(`/dashboard/lang/${value}?guildid=${this.props.datas.guildid}`)).data })
    } else {
      this.setState({ lang: (await Axios(`/dashboard/lang/en?guildid=${this.props.datas.guildid}`)).data })
    }
  }

  render () {
    return (
      <React.Fragment>
        <Base datas={this.props.datas} />
        <Divider hidden />
        <Container>
          <Card.Group centered>
            {Object.values(Infos).map(info => (
              <Card key={info.codeName}>
                <Link as={`/settings/${info.codeName}?guildid=${this.props.datas.guildid}`} passHref>
                  <Card.Content>
                    <Card.Header>{info.name}</Card.Header>
                    <Card.Description>{info.desc}</Card.Description>
                  </Card.Content>
                </Link>
              </Card>
            ))}
          </Card.Group>
          <Divider />
          <Header as='h2'>Select server's language!</Header>
          <Form>
            <Form.Field>
              <Checkbox radio value='ko' label='Korean' checked={this.state.lang === 'ko'} onChange={this.onClickLangChange} />
            </Form.Field>
            <Form.Field>
              <Checkbox radio value='en' label='English' checked={this.state.lang !== 'ko'} onChange={this.onClickLangChange} />
            </Form.Field>
          </Form>
        </Container>
      </React.Fragment>
    )
  }
}

export default DashBoard
