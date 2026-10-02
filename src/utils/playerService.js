import TrackPlayer from "react-native-track-player";

module.exports = async function() {
  TrackPlayer.addEventListener("remote-stop", () => TrackPlayer.stop());
};
