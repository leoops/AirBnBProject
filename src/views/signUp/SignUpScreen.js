import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageLogo from '../../images/airbnb_logo.png';
import { AsyncStorage, View } from 'react-native';
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

class SignUpScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      username: '',
      error: ''
    }
  }

  cadastro = async ({ email, password, username }) => {
    if (email == '' || password == '' || username == '') {
      return this.setHandlerState({
        param: 'error',
        value: 'Por favor preencha todos os campos'
      })
    }
    try {
      await api.post('/users', {
        email: email,
        password: password,
        username: username,
      });
      const response = await api.post('/sessions', {
        email: email,
        password: password,
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
      console.log(_err)
      this.setHandlerState({
        param: 'error',
        value: 'Houve um problema ao cadastrar, verifique novamente seus dados!'
      });
    }
  }
  voltarLogin = () => {
    this.props.navigation.navigate({ routeName: 'SignIn' })
  }
  setHandlerState = ({ param, value }) => {
    this.setState({
      [param]: value
    })
  }
  render() {
    const { email, password, username } = this.state
    return (
      <Container>
        <Logo source={ImageLogo} resizeMode="contain" />
        <Input
          placeholder="UserName"
          value={username}
          onChangeText={text => this.setHandlerState({ param: 'username', 'value': text })}
          autoCapitalize="none"
          autoCorrect={false}
        />
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
          onPress={() => this.cadastro({ email: email, password: password, username: username })}
        >
          <ButtonText>Cadastrar</ButtonText>
        </Button>
        <SignUpLink onPress={this.voltarLogin}>
          <SignUpLinkText>Já possui cadastro.</SignUpLinkText>
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
export default SignUpScreen;
