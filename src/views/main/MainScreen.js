import React, { Component } from 'react';

import { Container, AnnotationContainer, AnnotationText } from './styles';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import api from '../../services/api';

class MainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
    }
  }

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

  async componentDidMount() {
    try {
      const response = await api.get('/properties', {
        params: {
          latitude: -27.210768,
          longitude: -49.644018,
        },
      });
      this.setState({ locations: response.data });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <Container>
        <MapboxGL.MapView
          centerCoordinate={[-49.6446024, -27.2108001]}
          style={{ flex: 1 }}
          styleURL={MapboxGL.StyleURL.Dark}
        >
          {this.renderLocations()}
        </MapboxGL.MapView>
      </Container>
    );
  }
}

export default MainScreen;