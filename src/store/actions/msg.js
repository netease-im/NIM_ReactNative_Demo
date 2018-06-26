import { observable, action } from 'mobx';
import { Alert } from 'react-native';
import constObj from '../constant';
import nimStore from '../stores/nim';
import util from '../../util';
import uuid from '../../util/uuid';

class Actions {
  @observable nimStore
  @action
  appendMsg = (msg) => {
    const { sessionId } = msg;
    const tempMsgs = [];
    // if (nimStore.msgsMap[sessionId]) {
    //   nimStore.msgsMap[sessionId].push(msg);
    // }
    if (sessionId === nimStore.currentSessionId) {
      const msgLen = nimStore.currentSessionMsgs.length;
      if (msgLen > 0) {
        const lastMsgTime = nimStore.currentSessionMsgs[msgLen - 1].time;
        if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
          tempMsgs.push({
            type: 'timeTag',
            text: util.formatDate(msg.time, false),
          });
        }
      } else {
        tempMsgs.push({
          type: 'timeTag',
          text: util.formatDate(msg.time, false),
        });
      }
      tempMsgs.push(msg);
      nimStore.currentSessionMsgs = nimStore.currentSessionMsgs.concat(tempMsgs);
    }
  }

  @action
  sendTextMsg = (options) => {
    if (constObj.nim) {
      const { scene, to, text } = options;
      constObj.nim.sendText({
        scene,
        to,
        text,
        done: (error, msg) => {
          if (error) {
            Alert.alert('提示', error.message, [
              { text: '确认' },
            ]);
            return;
          }
          this.appendMsg(msg);
        },
      });
    }
  };

  @action
  sendCustomMsg = (options) => {
    if (constObj.nim) {
      const { scene, to, content } = options;
      constObj.nim.sendCustomMsg({
        scene,
        to,
        content: JSON.stringify(content),
        done: (error, msg) => {
          if (error) {
            Alert.alert('提示', error.message, [
              { text: '确认' },
            ]);
            return;
          }
          this.appendMsg(msg);
        },
      });
    }
  };

  @action
  sendImageMsg = (options) => {
    if (constObj.nim) {
      constObj.nim.previewFile({
        type: 'image',
        filePath: options.filePath,
        uploadprogress(obj) {
          console.log(`文件总大小: ${obj.total}bytes`);
          console.log(`已经上传的大小: ${obj.loaded}bytes`);
          console.log(`上传进度: ${obj.percentage}`);
          console.log(`上传进度文本: ${obj.percentageText}`);
        },
        done: (error, file) => {
          file.w = options.width;
          file.h = options.height;
          file.md5 = options.md5;
          file.size = options.size;
          const { scene, to } = options;
          if (!error) {
            constObj.nim.sendFile({
              type: 'image',
              scene,
              to,
              file,
              done: (err, msg) => {
                if (err) {
                  return;
                }
                this.appendMsg(msg);
              },
            });
          }
        },
      });
    }
  };

  @action sendMsgReceipt = (options = {}) => {
    const { msg } = options;
    constObj.nim.sendMsgReceipt({
      msg,
      done: function sendMsgReceiptDone(error) {
        if (error) {
          Alert.alert('提示', error.message, [
            { text: '确认' },
          ]);
        }
      },
    });
  }

  @action onBackoutMsg = (error, msg) => {
    // console.log(msg.to, msg.sessionId);
    if (error) {
      console.log(error);
      return;
    }
    let tip = '';
    let toAccount = '';
    if (msg.from === nimStore.userID) {
      tip = '你撤回了一条消息';
      toAccount = msg.to;
    } else {
      const userInfo = nimStore.userInfos[msg.from];
      if (userInfo) {
        tip = `${util.getFriendAlias(userInfo)}撤回了一条消息`;
      } else {
        tip = '对方撤回了一条消息';
      }
      toAccount = msg.from;
    }
    constObj.nim.sendTipMsg({
      isLocal: true,
      scene: msg.scene,
      to: toAccount,
      tip,
      time: msg.time,
      done: (tipErr, tipMsg) => {
        if (tipErr) {
          console.log(tipErr);
          return;
        }
        const idClient = msg.deletedIdClient || msg.idClient;
        const { sessionId } = msg;
        this.replaceMsg({
          sessionId,
          idClient,
          msg: tipMsg,
        });
      },
    });
  };

  @action backoutMsg = (msg) => {
    constObj.nim.deleteMsg({
      msg,
      done: (error) => {
        // Alert.alert('提示', '撤回一条消息', [
        //   { text: '确认' },
        // ]);
        this.onBackoutMsg(error, msg);
      },
    });
  }

  // 替换消息列表消息，如消息撤回
  @action replaceMsg = (obj) => {
    const { sessionId, idClient, msg } = obj;
    if (sessionId === nimStore.currentSessionId) {
      const tempMsgs = nimStore.currentSessionMsgs || [];
      if (tempMsgs.length > 0) {
        const lastMsgIndex = tempMsgs.length - 1;
        for (let i = lastMsgIndex; i >= 0; i -= 1) {
          const currMsg = tempMsgs[i];
          if (idClient === currMsg.idClient) {
            tempMsgs.splice(i, 1, msg);
            break;
          }
        }
        nimStore.currentSessionMsgs = util.simpleClone(tempMsgs);
      }
    }
  }

  @action getLocalMsgs =(sessionId, options = {}) => {
    const { reset, end, done } = options;
    constObj.nim.getLocalMsgs({
      sessionId,
      limit: 10,
      end,
      desc: true,
      done: (err, obj) => {
        if (!err) {
          const tempMsgs = [];
          if (sessionId === nimStore.currentSessionId) {
            let lastMsgTime = 0;
            obj.msgs = obj.msgs.sort((a, b) => a.time - b.time);
            obj.msgs.forEach((msg) => {
              if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
                lastMsgTime = msg.time;
                tempMsgs.push({
                  type: 'timeTag',
                  text: util.formatDate(msg.time, false),
                  key: uuid(),
                });
              }
              tempMsgs.push(msg);
            });
            if (!reset) {
              nimStore.currentSessionMsgs.forEach((item) => {
                tempMsgs.push(item);
              });
            }
            nimStore.currentSessionMsgs = tempMsgs;
          }
        }
        if (done instanceof Function) {
          done();
        }
      },
    });
  }

  @action
  deleteLocalMsgs = (options) => {
    const { scene, to } = options;
    constObj.nim.deleteLocalMsgsBySession({
      scene,
      to,
      done: (error) => {
        nimStore.currentSessionMsgs = [];
        if (options.done instanceof Function) {
          options.done(error);
        }
      },
    });
  }
  @action
  getHistoryMsgs = ({
    scene, to, endTime, done,
  }) => {
    constObj.nim.getHistoryMsgs({
      scene,
      to,
      endTime,
      reverse: false,
      asc: true,
      limit: 10,
      done(error, obj) {
        if (error) {
          Alert.alert('提示', error.message, [
            { text: '确认' },
          ]);
          return;
        }
        if (done instanceof Function) {
          done(obj.msgs);
        }
      },
    });
  }

  @action
  clearSysMsgs = () => {
    nimStore.sysMsgs = [];
  }
}

export default new Actions();
