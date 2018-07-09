import React, { Component } from 'react';
import { FlatList, Text, View, Image, ScrollView, TouchableOpacity, InteractionManager } from 'react-native';
import { Icon, Header } from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import { inject, observer } from 'mobx-react/native';
import util from '../util';
import uuid from '../util/uuid';
import { headerStyle, globalStyle, chatStyle, contactStyle } from '../themes';
import { RVW } from '../common';
import GoBack from '../components/goback';
import { ChatLeft, ChatRight } from '../components/chatMsg';
import { ChatBox } from '../components/chatBox';

// const fileList = [
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU4NTkzXzE1MzExMDY4OTg5NDJfZWY4MzM0ZTctM2NhNS00MjJhLTg1ZDEtMmQxYzEyN2Q2YTA2' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU4NTkzXzE1MzExMDY5MTQ5MDdfOWVkZTYzOWMtNTdiNC00NWQ4LWFhNGQtYmE2NDVmMzRhNjhj' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU4NTkzXzE1MzExMDY5MzAzODRfNDIwNzkyZjItMGUxZi00ZmE1LTliMTMtYWUyMmUzMzFhY2Uy' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU4NTkzXzE1MzExMDY5NDM0ODJfZmYwYmZjNmMtMmZkZC00OGQ0LWEyMzQtNTllOGMyZTc5NGZh' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU4NTkzXzE1MzExMDcwMjI1NDBfYjczZWFmY2YtNDc2Ni00NTI0LTk1NzgtMGM5Njk5YWJkOWFj' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU5NTMyXzE1MzExMDcwMzk3MDBfNTc3YzJmNjktOGNkMy00NmM1LWEzYzQtZjFkOTZhMzYxMjRh' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU5NTMyXzE1MzExMTc1NTU3NDFfYmE4Nzc2ZGYtMWVmYS00MzMyLWJhZWQtY2Q2ODAzNjAyNGY0' } },
//   { file: { url: 'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDU5NTMyXzE1MzExMTc2Mjk2NzBfYWUwZDcxMzgtMjJiYy00NWE2LTg2MTItYTNlZjc4OWIxMDI4' } },
// ];
const fileList = [
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422319&di=9f7c41a7fe17815041cb33dc8a816a92&imgtype=0&src=http%3A%2F%2Fb.zol-img.com.cn%2Fdesk%2Fbizhi%2Fimage%2F5%2F960x600%2F141774615961.jpg' } },
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422319&di=52ff47e4cace0aa9f952a8203f73af0d&imgtype=0&src=http%3A%2F%2Fpic.qiantucdn.com%2F58pic%2F18%2F32%2F07%2F39P58PIC9wJ_1024.png' } },
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422319&di=8ee28422731d2aaf55ea82ebf55f6df9&imgtype=0&src=http%3A%2F%2Ff.hiphotos.baidu.com%2Fzhidao%2Fpic%2Fitem%2Fb2de9c82d158ccbf79d70ffa1cd8bc3eb0354182.jpg' } },
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422319&di=e2ae3410c9cd657ffbdf0be568b62aac&imgtype=0&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201408%2F01%2F20140801224215_VNPR4.jpeg' } },
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422320&di=df67c0b3c3b2a4eda12576662d351a25&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0186e25944bcc0a8012193a3678c96.jpg%402o.jpg' } },
  { file: { url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531127422319&di=bb3b52207ee089e9fa76ba2bea2e6a51&imgtype=0&src=http%3A%2F%2Fa3.topitme.com%2Fa%2F0b%2F42%2F1161343925b5a420bao.jpg' } },
];

@inject('nimStore', 'msgAction', 'sessionAction')
@observer
export default class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      refreshing: false,
    };
    this.toAccount = '';
    this.scene = '';
    const sessionId = this.props.navigation.getParam('sessionId') || 'p2p-cs2';
    this.sessionId = sessionId;
    this.toast = null;
    this.scrollTimer = null;
    this.props.sessionAction.setCurrentSession(this.sessionId);
    this.props.msgAction.getLocalMsgs(this.sessionId, { reset: true });
    this.notScroll = false;
  }
  componentDidMount() {
    clearTimeout(this.scrollTimer);
    // this.scrollTimer = setTimeout(() => {
    InteractionManager.runAfterInteractions(() => {
      this.scrollToEnd();
    });
    // }, 200);
  }
  componentWillUnmount() {
    clearTimeout(this.scrollTimer);
  }
  scrollToEnd = (animated = false) => {
    // if (this.notScroll) {
    //   return;
    // }
    // util.debounce(200, () => {
    //   if (this.chatListRef) {
    //     // console.log('do');
    //     this.chatListRef.getNode().scrollToEnd({ animated });
    //   }
    // });
  }
  loadMore = () => {
    let end = Infinity;
    if (this.props.nimStore.currentSessionMsgs.length > 1) {
      end = this.props.nimStore.currentSessionMsgs[1].time;
    }
    this.setState({
      refreshing: true,
    });
    this.props.msgAction.getLocalMsgs(this.sessionId, {
      end,
      done: () => {
        this.notScroll = true;
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
        // InteractionManager.runAfterInteractions(() => {
          this.notScroll = false;
        // });
        }, 1000);
        this.setState({
          refreshing: false,
        });
      },
    });
  }
  sessionName = () => {
    const { sessionId } = this;
    const { userInfos } = this.props.nimStore;
    if (/^p2p-/.test(sessionId)) {
      const user = sessionId.replace(/^p2p-/, '');
      this.toAccount = user;
      this.scene = 'p2p';
      if (user === this.props.userID) {
        return '我的电脑';
      }
      const userInfo = userInfos[user] || {};
      return util.getFriendAlias(userInfo);
    } else if (/^team-/.test(sessionId)) {
      const team = sessionId.replace(/^team-/, '');
      this.toAccount = team;
      this.scene = 'team';
      return '群会话';
    }
    return sessionId;
  }
  renderMore = () => {
    if (this.state.showMore) {
      return (
        <View style={contactStyle.menuBox}>
          <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('chatHistroy', { sessionId: this.sessionId });
              this.setState({ showMore: false });
            }}
          >
            <Text style={contactStyle.menuLine}>云端历史记录</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
              this.props.msgAction.deleteLocalMsgs({
                scene: this.scene,
                to: this.toAccount,
                done: (error) => {
                  if (error) {
                    this.toast.show(JSON.stringify(error));
                  }
                },
              });
              this.setState({ showMore: false });
            }}
          >
            <Text style={contactStyle.menuLine}>清空本地历史记录</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }
  renderItem = ((item) => {
    const msg = item.item;
    if (msg.file) {
      console.log(msg.file.url);
      return (
        <View key={uuid()}>
          <Image key={uuid()} source={{ uri: msg.file.url }} style={{ width: 80 * RVW, height: 20 * RVW, backgroundColor: '#f0f' }} />
          <Text>{msg.file.url}</Text>
        </View>
      );
    }
    return null;
  })
  render() {
    const { navigation } = this.props;
    return (
      <View style={globalStyle.container}>
        <Header
          outerContainerStyles={headerStyle.wrapper}
          centerComponent={{ text: this.sessionName(), style: headerStyle.center }}
          leftComponent={
            <GoBack navigation={navigation} callback={this.props.sessionAction.resetCurrSession} />}
          rightComponent={<Icon
            type="evilicon"
            name="clock"
            size={9 * RVW}
            color="#fff"
            onPress={() => { this.setState({ showMore: !this.state.showMore }); }}
          />}
        />
        {/* <FlatList
          style={{ marginVertical: 20 }}
          data={this.props.nimStore.currentSessionMsgs}
          keyExtractor={item => (item.idClient || item.idClientFake || item.key || uuid())}
          renderItem={this.renderItem}
          ref={(ref) => { this.chatListRef = ref; }}
          onContentSizeChange={() => this.scrollToEnd()}
          onRefresh={this.loadMore}
          refreshing={this.state.refreshing}
        /> */}
        <ScrollView
          style={{ marginVertical: 20 }}
        >
          {/* {this.props.nimStore.currentSessionMsgs.map(item => this.renderItem({ item }))} */}
          {fileList.map(item => this.renderItem({ item }))}
        </ScrollView>
        <ChatBox
          action={this.props.msgAction}
          options={{
            scene: this.scene,
            toAccount: this.toAccount,
          }}
          toast={this.toast}
          chatListRef={this.chatListRef}
        />
        {this.renderMore()}
        <Toast ref={(ref) => { this.toast = ref; }} position="center" />
      </View>
    );
  }
}
