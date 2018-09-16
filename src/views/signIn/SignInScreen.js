import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageLogo from '../../images/airbnb_logo.png';
import { AsyncStorage } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import api from '../../services/api'
import {
  Container,
  Logo,
  Input,
  ErrorMessage,
  Button,
  ButtonText,
  SignUpLink,
  SignUpLinkText
} from './styles';

export default class SignInScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      error: ''
    }
  }

  login = async ({ email, password }) => {
    if (email == '' || password == '') {
      return this.setHandlerState({
        param: 'error',
        value: 'Por favor preencha todos os campos'
      })
    }
    try {
      const response = await api.post('/sessions', {
        email: email,
        password: password
      });

      await AsyncStorage.setItem('@AirBnbApp:token', response.data.token);

      const resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'Main' }),
        ],
      });
      this.props.navigation.dispatch(resetAction);
    } catch (_err) {
      this.setHandlerState({
        param: 'error',
        value: 'Houve um problema com o login, verifique suas credenciais!'
      });
    }
  }
  register = () => {
    this.props.navigation.replace('SignUp')
  }
  setHandlerState = ({ param, value }) => {
    this.setState({
      [param]: value
    })
  }
  render() {
    const { email, password } = this.state
    return (
      <Container>
        <Logo source={ImageLogo} resizeMode="contain" />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={text => this.setHandlerState({ param: 'email', 'value': text })}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          placeholder="Senha"
          value={password}
          onChangeText={text => this.setHandlerState({ param: 'password', 'value': text })}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        {this.state.error.length == 0 ? null : <ErrorMessage>{this.state.error}</ErrorMessage>}
        <Button
          onPress={() => this.login({ email: email, password: password })}
        >
          <ButtonText>Logar</ButtonText>
        </Button>
        <SignUpLink onPress={this.register}>
          <SignUpLinkText>Nao é cadastrardo? Registre-se</SignUpLinkText>
        </SignUpLink>
      </Container>
    );
  }
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    }).isRequired,
  };
}
