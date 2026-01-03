// Web ビルド用の React Native shim
// @pai-forge/mahjong-react-ui が React Native にも対応しているため、
// Web 環境では空のモジュールを提供する

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
}

export const Pressable = () => null
export const Image = () => null

export default {}
