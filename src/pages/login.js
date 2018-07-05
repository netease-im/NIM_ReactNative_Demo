import React from 'react';
import { inject, observer } from 'mobx-react/native';
// import { SafeView } from 'react-navigation';
import { View, Image, AsyncStorage, NetInfo } from 'react-native';
import { Input, Button } from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import { globalStyle, baseBlueColor } from '../themes';
import { RVW } from '../common';
import MD5 from '../util/md5';
import constObj from '../store/constant';

const localStyle = {
  wrapper: {
    backgroundColor: baseBlueColor,
  },
};

@inject('nimStore', 'linkAction')
@observer
export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
    };
  }
  componentWillMount = () => {
    AsyncStorage.getItem('account').then((account) => {
      if (account) {
        this.setState({
          account,
        });
      }
    });
    AsyncStorage.getItem('password').then((password) => {
      if (password) {
        this.setState({
          password,
        });
      }
    });
  }
  setAccount = (text) => {
    this.setState({
      account: text,
    });
  }
  setToken = (text) => {
    this.setState({
      password: text,
    });
  }
  login = () => {
    NetInfo.isConnected.fetch().then((isConnected) => {
      if (isConnected) {
        this.doLogin();
      } else {
        this.toast.show('网络状况不佳');
      }
    });
  }
  doLogin = () => {
    if (this.props.nimStore.userId && constObj.nim) {
      this.props.navigation.navigate('session');
      return;
    }
    let { account, password } = this.state;
    if (account.trim() === '' || password.trim() === '') {
      this.toast.show('请输入账号或密码');
      return;
    }
    account = account.toLowerCase();
    AsyncStorage.setItem('account', account);
    AsyncStorage.setItem('password', password);
    const token = MD5(this.state.password);

    // if (this.props.)
    this.props.linkAction.login(account, token, (error) => {
      if (error) {
        // if (this.toast) {
        //   this.toast.show(util.parseDisconnectMsg(error));
        // }
        this.props.navigation.navigate('login');
      } else {
        if (this.props.navigation.state.routeName === 'login') {
          this.props.navigation.navigate('session');
        }
        AsyncStorage.setItem('isLogin', 'true');
      }
    });
  }
  render() {
    return (
      // View 用以适配iPhoneX
      <View style={[globalStyle.container, globalStyle.center, localStyle.wrapper]}>
        <View
          style={{
            width: 80 * RVW,
          }}
        >
          <View style={{ marginVertical: 3 * RVW, flexDirection: 'row', justifyContent: 'center' }} >
            <Image style={{ width: 50 * RVW, height: 20 * RVW }} source={require('../res/logo.png')} />
          </View>
          <Input
            inputContainerStyle={{ width: 80 * RVW }}
            inputStyle={{ color: '#fff', top: 2 }}
            leftIcon={{ type: 'font-awesome', name: 'user', color: '#9ac6f7' }}
            placeholder="请输入账号"
            placeholderTextColor="#e0e0e0"
            onChangeText={this.setAccount}
            value={this.state.account}
            selectionColor="#fff"
          />
          <Input
            secureTextEntry
            inputContainerStyle={{ width: 80 * RVW }}
            inputStyle={{ color: '#fff', top: 2 }}
            leftIcon={{ type: 'font-awesome', name: 'lock', color: '#9ac6f7' }}
            placeholder="请输入密码"
            placeholderTextColor="#e0e0e0"
            onChangeText={this.setToken}
            value={this.state.password}
            selectionColor="#fff"
          />
          <Button
            title="登录"
            titleStyle={{ color: baseBlueColor }}
            onPress={this.login}
            buttonStyle={{
              backgroundColor: '#fff',
              marginVertical: 3 * RVW,
              borderRadius: 3,
            }}
          />
        </View>
        <Toast ref={(ref) => { this.toast = ref; }} position="center" />
      </View>
    );
  }
}
