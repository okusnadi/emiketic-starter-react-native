import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Spinner,
  Text,
  Icon,
  Label,
  Button,
  Card,
  CardItem,
  Thumbnail,
} from 'native-base';

import * as PropTypes from '../common/proptypes';

import { COLOR, STYLE } from '../common/styles';

// import * as Activity from '../Shared/Activity.state';

// import { $fetchProfile } from '../Auth/state';

const withStore = connect((state) => ({
  processing: state.Activity.processing,
  user: state.Auth.user,
}));

const propTypes = {
  dispatch: PropTypes.dispatch.isRequired,
  processing: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

const Wrapper = (C) => withStore(C);

class ProfileView extends Component {
  componentDidMount() {
    // this.props
    //   .dispatch($fetchProfile())
    //   .catch((error) => this.props.dispatch(Activity.$toast('failure', error.message)));
  }

  render() {
    const { user, processing } = this.props;

    return (
      <Container>
        <Header span style={{ height: 200, paddingTop: 6 }}>
          <View style={[STYLE.fit, STYLE.center]}>
            <View
              style={{
                alignItems: 'center',
                padding: 8,
              }}
            >
              <Thumbnail large resizeMode="cover" source={{ uri: user.picture }} />
              <Text style={{ marginTop: 10, color: COLOR.inverse }}>{user.name}</Text>
            </View>
          </View>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
              {processing ? <Spinner size="small" inverse /> : <Icon name="menu" />}
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>

        <Content>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Card
              transparent
              style={{
                marginLeft: 36,
                marginRight: 36,
                borderBottomWidth: 0,
                borderTopWidth: 0,
                borderRightWidth: 0,
                borderLeftWidth: 0,
              }}
            >
              <CardItem>
                <Body>
                  <Label style={{ fontSize: 16 }}>Email</Label>
                  <Text style={{ fontSize: 16 }}>{user.email}</Text>
                </Body>
                {/* {user.emailVerified ? (
                <Icon name="ios-checkmark-circle-outline" style={{ color: COLOR.success }} />
              ) : (
                <Icon name="ios-checkmark-circle-outline" style={{ color: 'gray' }} />
              )} */}
              </CardItem>
            </Card>
          </View>
        </Content>
      </Container>
    );
  }
}

const WrappedProfileView = Wrapper(ProfileView);

WrappedProfileView.propTypes = {
  navigation: PropTypes.navigation.isRequired,
};

ProfileView.propTypes = {
  ...WrappedProfileView.propTypes,
  ...propTypes,
};

export default WrappedProfileView;
