import { createStackNavigator } from 'react-navigation';
import * as Views from './views';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

MapboxGL.setAccessToken('pk.eyJ1IjoibGVvb3BzIiwiYSI6ImNqbHZsaXEyOTBuYTczcGxpMmQzNTMybjYifQ.nTkZtKmGYrz7t-dOXqL3cQ')

export const Routes = createStackNavigator({ ...Views });
