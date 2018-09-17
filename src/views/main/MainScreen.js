import React, { Component } from 'react';

import { StatusBar, Modal, AsyncStorage } from 'react-native';

import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { RNCamera } from 'react-native-camera';

import api from '../../services/api';
import markerImage from '../../images/marker.png'

import {
  Container,
  AnnotationContainer,
  AnnotationText,
  NewButtonContainer,
  ButtonsWrapper,
  CancelButtonContainer,
  SelectButtonContainer,
  ButtonText,
  Marker,
  ModalContainer,
  ModalImagesListContainer,
  ModalImagesList,
  ModalImageItem,
  ModalButtons,
  CameraButtonContainer,
  CancelButtonText,
  ContinueButtonText,
  TakePictureButtonContainer,
  TakePictureButtonLabel,
  DataButtonsWrapper,
  MarkerContainer,
  MarkerLabel,
  Form,
  Input,
  DetailsModalFirstDivision,
  DetailsModalSecondDivision,
  DetailsModalThirdDivision,
  DetailsModalBackButton,
  DetailsModalPrice,
  DetailsModalRealtyTitle,
  DetailsModalRealtySubTitle,
  DetailsModalRealtyAddress,
} from './styles';

const initialState = {
  locations: [],
  newRealty: false,
  detailsModalOpened: false,
  cameraModalOpened: false,
  dataModalOpened: false,
  realtyDetailed: null,
  realtyData: {
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

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  componentDidMount = () => {
    this.getLocation();
  }

  getLocation = async () => {
    try {
      const response = await api.get('/properties', {
        params: {
          latitude: -27.210768,
          longitude: -49.644018,
        },
      });

      this.setState({ locations: response.data });
    } catch (err) {
      console.tron.log(err);
    }
  }

  handleNewRealtyPress = () => this.setState({ newRealty: !this.state.newRealty })

  handleCameraModalClose = () => this.setState({ cameraModalOpened: !this.state.cameraModalOpened })

  handleDataModalClose = () => this.setState({
    dataModalOpened: !this.state.dataModalOpened,
    cameraModalOpened: false,
  })

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
      console.tron.log(err);
    }
  }

  handleTakePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
      const data = await this.camera.takePictureAsync(options)
      const { realtyData } = this.state;
      this.setState({
        realtyData: {
          ...realtyData,
          images: [
            ...realtyData.images,
            data,
          ]
        }
      })
    }
  }

  handleRealtyDataChange = (name, value) => {
    const { realtyData } = this.state;
    this.setState({
      realtyData: {
        ...realtyData,
        [name]: value,
      }
    });
  }

  handleDetailsModalClose = index => this.setState({
    detailsModalOpened: !this.state.detailsModalOpened,
    realtyDetailed: index,
  })



  saveRealty = async () => {
    try {
      const {
        realtyData: {
          name,
          address,
          price,
          location: {
            latitude,
            longitude
          },
          images
        }
      } = this.state;

      const newRealtyResponse = await api.post('/properties', {
        title: name,
        address,
        price,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
      });

      const imagesData = new FormData();

      images.forEach((image, index) => {
        imagesData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `${newRealtyResponse.data.title}_${index}.jpg`
        });
      });

      await api.post(
        `/properties/${newRealtyResponse.data.id}/images`,
        imagesData,
      );

      this.getLocation()
      this.handleDataModalClose()
      this.setState(initialState);
    } catch (err) {
      alert(err);
    }
  }

  renderConditionalsButtons = () => (
    !this.state.newRealty ? (
      <NewButtonContainer onPress={this.handleNewRealtyPress}>
        <ButtonText>Novo Imóvel</ButtonText>
      </NewButtonContainer>
    ) : (
        <ButtonsWrapper>
          <SelectButtonContainer onPress={this.handleGetPositionPress}>
            <ButtonText>Selecionar localização</ButtonText>
          </SelectButtonContainer>
          <CancelButtonContainer onPress={this.handleNewRealtyPress}>
            <ButtonText>Cancelar</ButtonText>
          </CancelButtonContainer>
        </ButtonsWrapper>
      )
  )

  renderLocations = () => (
    this.state.locations.map((location, index) => (
      <MapboxGL.PointAnnotation
        id={location.id.toString()}
        coordinate={[parseFloat(location.longitude), parseFloat(location.latitude)]}
        key={location.id.toString()}
      >
        <AnnotationContainer>
          <AnnotationText onPress={() => this.handleDetailsModalClose(index)}>{location.price}</AnnotationText>
        </AnnotationContainer>
      </MapboxGL.PointAnnotation>
    ))
  );

  renderMarker = () => (
    this.state.newRealty && !this.state.cameraModalOpened ? (
      <Marker resizeMode="contain" source={markerImage} />
    ) : null
  )

  renderImagesList = () => (
    this.state.realtyData.images.length !== 0 ? (
      <ModalImagesListContainer>
        <ModalImagesList horizontal>
          {this.state.realtyData.images.map(image => (
            <ModalImageItem source={{ uri: image.uri }} resizeMode="stretch" />
          ))}
        </ModalImagesList>
      </ModalImagesListContainer>
    ) : null
  )
  renderDetailsModal = () => {
    const { locations, realtyDetailed } = this.state
    return (
      <Modal
        visible={this.state.detailsModalOpened}
        transparent={false}
        animationType="slide"
        onRequestClose={this.handleDetailsModalClose}
      >
        <ModalContainer>
          <DetailsModalFirstDivision>
            <DetailsModalBackButton onPress={() => this.handleDetailsModalClose(null)}>
              Voltar
          </DetailsModalBackButton>
          </DetailsModalFirstDivision>
          <DetailsModalSecondDivision>
            <DetailsModalRealtyTitle>
              {this.state.detailsModalOpened
                ? locations[realtyDetailed].title
                : ''
              }
            </DetailsModalRealtyTitle>
            <DetailsModalRealtySubTitle></DetailsModalRealtySubTitle>
            <DetailsModalRealtyAddress>
              {this.state.detailsModalOpened
                ? locations[realtyDetailed].adrress
                : ''
              }
            </DetailsModalRealtyAddress>
            {this.renderDetailsImagesList()}
          </DetailsModalSecondDivision>
          <DetailsModalThirdDivision>
            <DetailsModalPrice>R$ {this.state.detailsModalOpened
              ? locations[realtyDetailed].price
              : 0
            }
            </DetailsModalPrice>
          </DetailsModalThirdDivision>
        </ModalContainer>
      </Modal>
    )
  }
  renderDetailsImagesList = () => (
    this.state.detailsModalOpened && (
      <ModalImagesList horizontal>
        {this.state.locations[this.state.realtyDetailed].images.map(image => (
          <ModalImageItem
            key={image.id}
            source={{ uri: image.url }}
            resizeMode="stretch"
          />
        ))}
      </ModalImagesList>
    )
  )

  renderCameraModal = () => (
    <Modal
      visible={this.state.cameraModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleCameraModalClose}
    >
      <ModalContainer>
        <ModalContainer>
          <RNCamera
            ref={camera => {
              this.camera = camera;
            }}
            style={{ flex: 1 }}
            type={RNCamera.Constants.Type.back}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle={"Permission to use camera"}
            permissionDialogMessage={
              "We need your permission to use your camera phone"
            }
          />
          <TakePictureButtonContainer onPress={this.handleTakePicture}>
            <TakePictureButtonLabel />
          </TakePictureButtonContainer>
        </ModalContainer>
        {this.renderImagesList()}
        <ModalButtons>
          <CameraButtonContainer onPress={this.handleCameraModalClose}>
            <CancelButtonText>Cancelar</CancelButtonText>
          </CameraButtonContainer>
          <CameraButtonContainer onPress={this.handleDataModalClose}>
            <ContinueButtonText>Continuar</ContinueButtonText>
          </CameraButtonContainer>
        </ModalButtons>
      </ModalContainer>
    </Modal>
  )

  renderDataModal = () => (
    <Modal
      visible={this.state.dataModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDataModalClose}
    >
      <ModalContainer>
        <ModalContainer>
          <MapboxGL.MapView
            centerCoordinate={[
              this.state.realtyData.location.longitude,
              this.state.realtyData.location.latitude
            ]}
            style={{ flex: 1 }}
            styleURL={MapboxGL.StyleURL.Dark}
          >
            <MapboxGL.PointAnnotation
              id="center"
              coordinate={[
                this.state.realtyData.location.longitude,
                this.state.realtyData.location.latitude
              ]}
            >
              <MarkerContainer>
                <MarkerLabel />
              </MarkerContainer>
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
        </ModalContainer>
        {this.renderImagesList()}
        <Form>
          <Input
            placeholder="Nome do Imóvel"
            value={this.state.realtyData.name}
            onChangeText={value => this.handleRealtyDataChange('name', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Endereço"
            value={this.state.realtyData.address}
            onChangeText={value => this.handleRealtyDataChange('address', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Preço"
            value={this.state.realtyData.price}
            onChangeText={value => this.handleRealtyDataChange('price', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Form>
        <DataButtonsWrapper>
          <SelectButtonContainer onPress={this.saveRealty}>
            <ButtonText>Salvar Imóvel</ButtonText>
          </SelectButtonContainer>
          <CancelButtonContainer onPress={this.handleDataModalClose}>
            <ButtonText>Cancelar</ButtonText>
          </CancelButtonContainer>
        </DataButtonsWrapper>
      </ModalContainer>
    </Modal>
  )

  render = () => (
    <Container>
      <StatusBar barStyle="light-content" />
      <MapboxGL.MapView
        centerCoordinate={[-49.6446024, -27.2108001]}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Dark}
        ref={(map) => { this.map = map; }}
      >
        {this.renderLocations()}
      </MapboxGL.MapView>
      {this.renderConditionalsButtons()}
      {this.renderMarker()}
      {this.renderCameraModal()}
      {this.renderDataModal()}
      {this.renderDetailsModal()}
    </Container>
  );
}