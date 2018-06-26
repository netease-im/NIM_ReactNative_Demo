import {NativeModules} from 'react-native'

export default NativeModules.NIMPushModule

export function getDeviceInfo (callback) {
  NativeModules.NIMPushModule.getDeviceInfo(callback)
}

export function onLogin ({account, pushType, hasPushed = false, lastDeviceId = ''}) {
  NativeModules.NIMPushModule.onLogin(account, pushType, hasPushed, lastDeviceId)
}

export function showNotification ({icon, title, content, time}) {
  NativeModules.NIMPushModule.showNotification(icon, title, content, time)
}

export function clearNotification () {
  NativeModules.NIMPushModule.clearNotification()
}

export function registerPush ({
  xmAppId,
  xmAppKey,
  xmCertificateName,
  hwCertificateName,
  mzAppId,
  mzAppKey,
  mzCertificateName,
  fcmCertificateName,
  tokenCallback}){
  NativeModules.NIMPushModule.init(xmAppId, xmAppKey, xmCertificateName,
      hwCertificateName,mzAppId,mzAppKey,mzCertificateName,fcmCertificateName,tokenCallback);
}

export function onLogout () {
  NativeModules.NIMPushModule.onLogout()
}

export function setDeviceId (deviceId) {
  NativeModules.NIMPushModule.setDeviceId(deviceId)
}
