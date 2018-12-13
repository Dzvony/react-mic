function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// cool blog article on how to do this: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

// distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

import React, { PureComponent } from 'react';
import { string, number, bool, func } from 'prop-types';
import { MicrophoneRecorder } from '../libs/MicrophoneRecorder';
import AudioContext from '../libs/AudioContext';
import AudioPlayer from '../libs/AudioPlayer';
import Visualizer from '../libs/Visualizer';

var ReactMic = function (_PureComponent) {
  _inherits(ReactMic, _PureComponent);

  function ReactMic(props) {
    _classCallCheck(this, ReactMic);

    var _this = _possibleConstructorReturn(this, _PureComponent.call(this, props));

    _this.visualize = function () {
      var self = _this;
      var _this$props = _this.props,
          record = _this$props.record,
          backgroundColor = _this$props.backgroundColor,
          strokeColor = _this$props.strokeColor,
          width = _this$props.width,
          height = _this$props.height,
          visualSetting = _this$props.visualSetting,
          fps = _this$props.fps;
      var _this$state = _this.state,
          canvas = _this$state.canvas,
          canvasCtx = _this$state.canvasCtx,
          analyser = _this$state.analyser;


      if (!record) {
        Visualizer.stopVisualization(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
        return;
      }
      if (visualSetting === 'sinewave') {
        Visualizer.visualizeSineWave(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor, fps);
      } else if (visualSetting === 'frequencyBars') {
        Visualizer.visualizeFrequencyBars(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor);
      } else if (visualSetting === 'frequencyCircles') {
        Visualizer.visualizeFrequencyCircles(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor);
      }
    };

    _this.state = {
      analyser: null,
      microphoneRecorder: null,
      canvas: null,
      canvasCtx: null
    };
    return _this;
  }

  ReactMic.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    var _props = this.props,
        onSave = _props.onSave,
        onStop = _props.onStop,
        onStart = _props.onStart,
        onData = _props.onData,
        audioElem = _props.audioElem,
        audioBitsPerSecond = _props.audioBitsPerSecond,
        mimeType = _props.mimeType;
    var visualizer = this.refs.visualizer;

    var canvas = visualizer;
    var canvasCtx = canvas.getContext("2d");
    var options = {
      audioBitsPerSecond: audioBitsPerSecond,
      mimeType: mimeType
    };

    if (audioElem) {
      var analyser = AudioContext.getAnalyser();

      AudioPlayer.create(audioElem);

      this.setState({
        analyser: analyser,
        canvas: canvas,
        canvasCtx: canvasCtx
      }, function () {
        _this2.visualize();
      });
    } else {
      var _analyser = AudioContext.getAnalyser();

      this.setState({
        analyser: _analyser,
        microphoneRecorder: new MicrophoneRecorder(onStart, onStop, onSave, onData, options),
        canvas: canvas,
        canvasCtx: canvasCtx
      }, function () {
        _this2.visualize();
      });
    }
  };

  ReactMic.prototype.componentDidUpdate = function componentDidUpdate() {
    this.visualize(); // set-up or stop canvas animation based on prop.record
  };

  ReactMic.prototype.clear = function clear() {
    var _props2 = this.props,
        width = _props2.width,
        height = _props2.height;
    var canvasCtx = this.state.canvasCtx;

    canvasCtx.clearRect(0, 0, width, height);
  };

  ReactMic.prototype.render = function render() {
    var _props3 = this.props,
        record = _props3.record,
        onStop = _props3.onStop,
        width = _props3.width,
        height = _props3.height;
    var _state = this.state,
        analyser = _state.analyser,
        microphoneRecorder = _state.microphoneRecorder,
        canvasCtx = _state.canvasCtx;


    if (record) {
      if (microphoneRecorder) {
        microphoneRecorder.startRecording();
      }
    } else {
      if (microphoneRecorder) {
        microphoneRecorder.stopRecording(onStop);
        this.clear();
      }
    }

    return React.createElement('canvas', { ref: 'visualizer', height: height, width: width, className: this.props.className });
  };

  return ReactMic;
}(PureComponent);

export { ReactMic as default };


process.env.NODE_ENV !== "production" ? ReactMic.propTypes = {
  backgroundColor: string,
  strokeColor: string,
  className: string,
  audioBitsPerSecond: number,
  mimeType: string,
  height: number,
  record: bool.isRequired,
  onStop: func,
  onData: func,
  fps: number
} : void 0;

ReactMic.defaultProps = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  strokeColor: '#000000',
  className: 'visualizer',
  audioBitsPerSecond: 128000,
  mimeType: 'audio/webm;codecs=opus',
  record: false,
  width: 640,
  height: 100,
  visualSetting: 'sinewave',
  fps: 30
};