import React, { Component } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { Container, AnnotationContainer, AnnotationText, NewButtonContainer, ButtonText, ButtonsWrapper, SelectButtonContainer, CancelButtonContainer, Marker} from './styles';
import api from '../../services/api';

import MarkerImage from '../../images/marker.png'

class MainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      newRealty: false,
      cameraModalOpened: false,
      dataModalOpened: false,
      raeltyData: {
        location: {
          latitude: null,
          longitude: null,
        },
        name: '',
        price: '',
        address: '',
        images: [],
      },
    };
  };
  
  handlerSetState = (name,value) => {
    this.setState({
      [name]: value
    })
  }
  componentWillMount = async () => {
    try {
      const response = await api.get('/properties', {
        params: {
          latitude: -27.210768,
          longitude: -49.644018,
        },
      });
      this.handlerState('locations', response.data);

    } catch (err) {
      console.log(err);
    }
  };
  renderMarker = () => (
    this.state.newRealty &&
    !this.state.cameraModalOpened &&
    <Marker resizeMode="contain" source={MarkerImage} />
  )
  renderLocations = () => (
    this.state.locations.map(location => (
      <MapboxGL.PointAnnotation
        id={location.id.toString()}
        coordinate={[parseFloat(location.longitude), parseFloat(location.latitude)]}
      >
        <AnnotationContainer>
          <AnnotationText>{location.price}</AnnotationText>
        </AnnotationContainer>
        <MapboxGL.Callout title={location.title} />
      </MapboxGL.PointAnnotation>
    ))
  )
  renderConditionalsButtons = () => (
    !this.state.newRealty ? (
      <NewButtonContainer onPress={ () => this.handlerSetState('newRealty', !this.state.newRealty)}>
        <ButtonText>Novo Imóvel</ButtonText>
      </NewButtonContainer>
    ) : (
      <ButtonsWrapper>
        <SelectButtonContainer onPress={this.handleGetPositionPress}>
          <ButtonText>Selecionar Localização</ButtonText>
        </SelectButtonContainer>
        <CancelButtonContainer onPress={ () => this.handlerSetState('newRealty', !this.state.newRealty)}>
          <ButtonText>Cancelar</ButtonText>
        </CancelButtonContainer>
      </ButtonsWrapper>
    )
  )

  handleGetPositionPress = async () => {
    try {
      const [longitude, latitude] = await this.map.getCenter();
      this.setState({
        cameraModalOpened: true,
        realtyData: {
          ...this.state.realtyData,
          location: {
            latitude,
            longitude,
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  
  render = () => {
    return (
      <Container>
        <MapboxGL.MapView
          ref={map => {
            this.map = map;
          }}
          centerCoordinate={[-49.6446024, -27.2108001]}
          style={{ flex: 1 }}
          styleURL={MapboxGL.StyleURL.Dark}
        >
          {this.renderLocations()}
        </MapboxGL.MapView>
        { this.renderConditionalsButtons() }
        { this.renderMarker() }
      </Container>
    );
  }
}

export default MainScreen;