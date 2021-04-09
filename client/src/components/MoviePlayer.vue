<template>
  <div
    :id="source.id+'-player'"
    :ref="source.id+'-player'"
    class="mp-video-player"
    @mouseenter="onMouseenterVideo"
    @mouseleave="onMouseleaveVideo"
  >
    <video
      :id="source.id+'-video'"
      :ref="source.id+'-video'"
      :class="['mp-video', {'hide-cursor': !state.showCtrls}]"
      :preload="options.preload"
      controls
    >
      <source
        :src="source.src"
        :type="source.type"
      />
    </video>

    <transition name="fade-down">
      <div class="mp-ctrls-topleft"
        v-show="state.showCtrls && state.showSecondaryCtrls"
      >
        <button class="mp-ctrl-btn"
          @click="onClickReduceSpeedButton"
        >
          <font-awesome-icon
            icon="minus-square"
          />
        </button>
        <span class="mp-info-icon">
          <font-awesome-icon
            icon="tachometer-alt"
          />
        </span>
        <button class="mp-ctrl-btn"
          @click="onClickIncreaseSpeedButton"
        >
          <font-awesome-icon
            icon="plus-square"
          />
        </button>
        <div class="mp-info-text-container">
          <span class="mp-info-text">
            {{ video.playbackRate }} x
          </span>
        </div>
      </div>
    </transition>


    <transition name="fade-up">
      <div class="mp-ctrls-bottom"
        v-show="state.showCtrls"
      >
        <button class="mp-ctrl-btn"
          @click="onClickPlayButton"
        >
          <font-awesome-icon
            v-if="!state.isPlaying"
            icon="play"
          />
          <font-awesome-icon
            v-if="state.isPlaying"
            icon="pause"
          />
        </button>
        <div class="mp-info-text-container">
          <span class="mp-info-text">
            {{player.displayTimeElapsed}}
          </span>
        </div>
        <div
          :id="source.id+'-playback-slider'"
          :ref="source.id+'-playback-slider'" 
          class="mp-ctrl-playback-slider"
          @click="onClickPlaybackSlider"
          @mousedown="onMousedownPlaybackSlider"
        >
          <div
            :id="source.id+'-playback-head'"
            :ref="source.id+'-playback-head'" 
            class="mp-playback-head"
            :style="{'transform': 'translateX('+player.pos.current+'px)'}"
          ></div>
          <div class="mp-playback-rail">
            <div
              class="mp-playback-rail-buffered"
              :style="{'transform': 'translateX('+video.buffered+'%)'}"
            ></div>
          </div>
        </div>
        <div class="mp-info-text-container">
          <span class="mp-info-text">
            {{player.displayTimeRemaining}}
          </span>
        </div>
        <div class="mp-ctrl-volume">
          <button
            class="mp-ctrl-btn"
            @click="onClickVolumeButton"
          >
            <font-awesome-icon
              v-if="volume.percent >= 50 && !volume.muted"
              icon="volume-up"
            />
            <font-awesome-icon
              v-if="volume.percent < 50 && !volume.muted"
              icon="volume-down"
            />
            <font-awesome-icon
              v-if="volume.muted"
              icon="volume-mute"
            />
          </button>
          <div
            :id="source.id+'-vol-slider'"
            :ref="source.id+'-vol-slider'"
            class="mp-ctrl-vol-slider"
            @click="onClickVolumeSlider"
            @mousedown="onMousedownVolumeSlider"
          >
            <div
              :id="source.id+'-vol-level'"
              :ref="source.id+'-vol-level'"
              class="mp-ctrl-vol-level"
              :style="{'transform': 'translateX('+volume.pos.current+'px)'}"
            >
            </div>
            <div class="mp-ctrl-vol-rail"></div>
          </div>
        </div>
        <button
          class="mp-ctrl-btn"
          v-if="!state.isFullscreen"
          @click="onClickFullWidthButton"
        >
          <font-awesome-icon
            v-if="!state.isFullWidth"
            icon="expand-arrows-alt"
          />
          <font-awesome-icon
            v-if="state.isFullWidth"
            icon="compress-arrows-alt"
          />
        </button>
        <button
          class="mp-ctrl-btn"
          v-if="!state.isFullWidth"
          @click="onClickFullscreenButton"
        >
          <font-awesome-icon
            v-if="!state.isFullscreen"
            icon="expand"
          />
          <font-awesome-icon
            v-if="state.isFullscreen"
            icon="compress"
          />
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
const getMousePosition = (e, type = 'x') => {
  if (type === 'x') {
    return e.pageX
  }
  return e.pageY
}
const pad = (val) => {
  val = Math.floor(val)
  if (val < 10) {
    return '0' + val
  }
  return val + ''
}
const timeParse = (sec) => {
  let hrs = 0
  let min = 0
  hrs = Math.floor(sec / 60 / 60)
  min = Math.floor(sec / 60) - hrs * 60
  sec = sec - min * 60 - hrs * 60 * 60
  return (hrs ? hrs + ':' : '') + pad(min) + ':' + pad(sec)
}
export default {
  name:"MoviePlayer",
  props: {
    source: Object,
    options: {
      type: Object,
      default() {
        return {
          autoplay: false,
          volume: 0.1,
          poster: '',
          playsinline: true,
          preload: 'metadata'
        }
      }
    }
  },
  data() {
    return {
      videoEl: null,
      video: {
        current: 0,
        buffered: 0,
        playbackRate: 1,
      },
      volume: {
        sliderEl: null,
        levelEl: null,
        muted: false,
        percent: 60,
        hasMousedown: false,
        pos: {
          start: 0,
          width: 0,
          innerWidth: 0,
          current: 0
        }
      },
      player: {
        playerEl: null,
        playbackSliderEl: null,
        playbackHeadEl: null,
        displayTimeRemaining: '00:00',
        displayTimeElapsed: '00:00',
        hasMousedown: false,
        domRect: null,
        pos: {
          start: 0,
          width: 0,
          innerWidth: 0,
          current: 0
        },
      },
      tmp: {
        ctrlsDisplayTimer: null,
        isFullscreenSupported: null
      },
      state: {
        showCtrls: true,
        showSecondaryCtrls: true,
        vol: 0.5,
        currentTime: 0,
        isFullWidth: false,
        isFullscreen: false,
        isPlaying: false
      }
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (this.player.playerEl) {
      this.player.playerEl.removeEventListener('mousemove', this.onMousemovePlayer)
      this.player.playerEl.removeEventListener('mouseup', this.onMouseupPlayer)
      }
  },
  methods: {
    init() {
      this.videoEl = this.$refs && this.$refs[this.source.id+'-video']
      this.supportsVideo = this.videoEl.canPlayType;
      if (this.supportsVideo) {
        // Hide the default controls
        this.videoEl.controls = false;
        this.initVideo()
        this.initPlayer()
        if (this.options.autoplay) {
          this.togglePlay()
        }
      } else {
        this.state.showCtrls = false
      }
    },
    initPlayer() {
      const playerEl = this.$refs && this.$refs[this.source.id+'-player']
      const playbackSliderEl = this.$refs && this.$refs[this.source.id+'-playback-slider']
      const playbackHeadEl = this.$refs && this.$refs[this.source.id+'-playback-head']

      this.player.domRect = playerEl.getBoundingClientRect()
      this.player.playerEl = playerEl
      this.player.playbackSliderEl = playbackSliderEl
      this.player.playbackHeadEl = playbackHeadEl
      this.player.playerEl.addEventListener('mousemove', this.onMousemovePlayer, false)
      this.player.playerEl.addEventListener('mouseup', this.onMouseupPlayer, false)
      this.setPlaybackDimensions()
      this.initVolume()
    },
    initVolume() {
      const sliderEl = this.$refs && this.$refs[this.source.id+'-vol-slider']
      const levelEl = this.$refs && this.$refs[this.source.id+'-vol-level']
      const vol = this.options.volume || 0.9
      this.setVolume(vol)
      this.volume.sliderEl = sliderEl
      this.volume.levelEl = levelEl
      this.setVolumeDimensions()
    },
    initVideo() {
      this.videoEl.addEventListener('durationchange', this.onDurationchangeVideo)
      this.videoEl.addEventListener('progress', this.onProgressVideo)
      this.videoEl.addEventListener('timeupdate', this.onTimeupdateVideo)
      this.videoEl.addEventListener('ended', this.onEndedVideo)
    },
    setVolumeDimensions() {
      let v = this.volume
      v.pos.innerWidth = v.levelEl.getBoundingClientRect().width
      v.pos.start = v.sliderEl.getBoundingClientRect().left
      v.pos.width = v.sliderEl.getBoundingClientRect().width - v.pos.innerWidth
    },
    setPlaybackDimensions() {
      let p = this.player
      p.pos.start = p.playbackSliderEl.getBoundingClientRect().left
      p.pos.innerWidth = p.playbackHeadEl.getBoundingClientRect().width
      p.pos.width = p.playbackSliderEl.getBoundingClientRect().width - p.pos.innerWidth
    },
    setPlayerDimensions() {
      this.$nextTick(() => {
        this.setPlaybackDimensions()
        this.setVolumeDimensions()
      })
    },
    onDurationchangeVideo() {
      if (this.player.displayTimeRemaining === '00:00') {
        // initialize the displayTimeRemaining value
        this.player.displayTimeRemaining = timeParse(this.videoEl.duration)
      }
    },
    onProgressVideo() {
      let duration = this.videoEl.duration
      if (duration > 0) {
        let buffered = this.videoEl.buffered
        for (var i = 0; i < buffered.length; i++) {
          if (buffered.start(buffered.length - 1 - i) < this.videoEl.currentTime) {
            this.video.buffered = (-1 + buffered.end(buffered.length - 1 - i) / duration) * 100;
            break;
          }
        }
      }
    },
    onTimeupdateVideo() {
      const percent = this.videoEl.currentTime / this.videoEl.duration
      this.player.pos.current = (this.player.pos.width * percent).toFixed(3)
      this.player.displayTimeRemaining = timeParse(this.videoEl.duration - this.videoEl.currentTime)
      this.player.displayTimeElapsed = timeParse(this.videoEl.currentTime)
    },
    onEndedVideo() {
      this.state.isPlaying = false
      this.player.pos.current = 0
      this.videoEl.currentTime = 0
    },
    showControls() {
      if (this.tmp.ctrlsDisplayTimer) {
        clearTimeout(this.tmp.ctrlsDisplayTimer)
        this.tmp.ctrlsDisplayTimer = null
      }
      this.state.showCtrls = true
    },
    hideControls(delay) {
      if (this.tmp.ctrlsDisplayTimer) {
        clearTimeout(this.tmp.ctrlsDisplayTimer)
      }
      this.tmp.ctrlsDisplayTimer = setTimeout(() => {
        if (this.state.isPlaying) this.state.showCtrls = false
        this.tmp.ctrlsDisplayTimer = null
      }, delay)
    },
    onMouseenterVideo() {
      this.showControls()
    },
    onMouseleaveVideo() {
      this.hideControls(3000)
    },
    setVideoByTime(percent) {
      this.videoEl.currentTime = Math.floor(percent * this.videoEl.duration)
    },
    togglePlay() {
      this.state.isPlaying = !this.state.isPlaying
      if (this.videoEl) {
        if (this.state.isPlaying) {
          this.videoEl.play()
          this.hideControls(5000)
        } else {
          this.videoEl.pause()
        }
      }
    },
    onClickPlayButton() {
      this.togglePlay()
    },
    onMousedownVolumeSlider() {
      this.setVolumeDimensions()
      this.volume.hasMousedown = true
    },
    onMousedownPlaybackSlider() {
      this.setPlaybackDimensions()
      this.player.hasMousedown = true
    },
    onClickPlaybackSlider(e) {
      this.playbackSlideMove(e)
    },
    onClickVolumeSlider(e) {
      this.volumeSlideMove(e)
    },
    onClickVolumeButton() {
      this.videoEl.muted = !this.videoEl.muted
      this.volume.muted = this.videoEl.muted
    },
    setVolume(val) {
      if (this.videoEl) {
        this.volume.pos.current = val * this.volume.pos.width
        this.volume.percent = val * 100
        this.videoEl.volume = val
      }
    },
    onClickFullWidthButton() {
      this.$emit('toggle-fullwidth')
      this.state.isFullWidth = !this.state.isFullWidth
      this.setPlayerDimensions()
    },
    onClickFullscreenButton() {
      const elem = this.player.playerEl
      const isFullScreen = !!(document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement)
      if (!isFullScreen) {
        elem.requestFullscreen = elem.requestFullscreen 
          || elem.mozRequestFullscreen
          || elem.msRequestFullscreen
          || elem.webkitRequestFullscreen
          || elem.webkitRequestFullScreen
        elem.requestFullscreen()
          .then(() => {
            this.state.isFullscreen = true
            this.setPlayerDimensions()
          })
          .catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen = document.exitFullscreen
          || document.mozCancelFullScreen
          || document.msExitFullscreen
          || document.webkitCancelFullScreen
        document.exitFullscreen().then(() => {
          this.state.isFullscreen = false
          this.setPlayerDimensions()
        })
      }
    },
    onMousemovePlayer(e) {
      if (this.volume.hasMousedown) {
        this.volumeSlideMove(e)
      }
      if (this.player.hasMousedown) {
        this.playbackSlideMove(e)
      }
    },
    volumeSlideMove(e) {
      const x = getMousePosition(e) - this.volume.pos.start
      if (x > 0 && x < this.volume.pos.width) {
        this.setVolume(x / this.volume.pos.width)
      }
    },
    playbackSlideMove(e) {
      const x = getMousePosition(e) - this.player.pos.start
      if (x > 0 && x < this.player.pos.width) {
        this.player.pos.current = x
        this.setVideoByTime(x / this.player.pos.width)
      }
    },
    onMouseupPlayer() {
      this.volume.hasMousedown = false
      this.player.hasMousedown = false
    },
    onClickReduceSpeedButton() {
      this.video.playbackRate = .5 * this.video.playbackRate
      this.videoEl.playbackRate = this.video.playbackRate
    },
    onClickIncreaseSpeedButton() {
      this.video.playbackRate = 2 * this.video.playbackRate
      this.videoEl.playbackRate = this.video.playbackRate
    },
  }
}
</script>

<style>
.mp-video-player {
  position: relative;
  width: 100%;
  background-color: #000;
}

.mp-video {
  width: 100%;
  height: 100%;
  vertical-align: bottom;
}

.mp-ctrls-bottom {
  position: absolute;
  display: flex;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.54);
  height: 2em;
  width: 100%;
  z-index: 3;
}
.mp-ctrls-topleft {
  position: absolute;
  display: flex;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.54);
  z-index: 3;
  padding-right: .7em;
  height: 2em;
}
.mp-info-icon,
.mp-ctrl-btn {
  position: relative;
  background: none;
  border: none;
  height: 2em;
  width: 2em;
  outline: none;
  vertical-align: top;
  margin: 0;
  padding: 0 3px;
}
.mp-ctrl-btn:hover {
  background-color: rgba(255, 255, 255, 0.27);
}
.mp-info-icon {
  padding: 5px 0;
  width: auto;
}
.mp-info-icon svg,
.mp-ctrl-btn svg {
  margin: 0;
  padding: 0;
}
.mp-ctrl-vol-slider {
  position: relative;
  display: inline-block;
  height: 100%;
  width: 2em;
  height: 2em;
  overflow: hidden;
  transition: all .2s ease-in;
}
.mp-ctrl-vol-rail {
  position: absolute;
  top: 50%;
  width: 2em;
  height: .1em;
  margin-top: -.05em;
  background: #cec0a1;
}
.mp-ctrl-vol-level {
  position: absolute;
  display: inline-block;
  left: 0;
  top: 50%;
  background: #cec0a1;
  width: .5em;
  height: .5em;
  border-radius: 50%;
  margin-top: -.25em;
  z-index: 2;
  cursor: pointer;
}
.mp-ctrl-volume {
  display: flex;
}
.mp-ctrl-playback-slider {
  position: relative;
  display: inline-block;
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0 .5em;
  transition: all .2s ease-in;
}
.mp-playback-rail {
  position: absolute;
  top: 50%;
  width: 100%;
  height: .1em;
  margin-top: -.05em;
  background: #cec0a150;
  overflow: hidden;
}
.mp-playback-rail-buffered {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: .1em;
  background: #cec0a1;
  transition: transform .2s;
}
.mp-playback-head {
  position: absolute;
  display: inline-block;
  left: 0;
  top: 50%;
  background: #cec0a1;
  width: .3em;
  height: .8em;
  margin-top: -.4em;
  z-index: 2;
  cursor: pointer;
  transition: all 16ms;
}

.mp-info-text-container {
  padding-top: .15em;
}
.mp-info-text {
  color: #cec0a1;
  line-height: 2em;
  font-size: .8em;
}
::media-controls {
 display:none !important;
}
video::media-controls {
 display:none !important;
}
video::media-controls-enclosure {
 display:none !important;
}


.fade-up-enter-active,
.fade-up-leave-active,
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.4s ease-in-out, transform 0.4s ease-in-out;
}
.fade-down-enter,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-9px);
}

.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(9px);
}

.hide-cursor {
  cursor: none;
}
</style>
