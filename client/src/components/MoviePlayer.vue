<template>
  <div
    :id="source.id+'-player'"
    :ref="source.id+'-player'"
    class="mp-video-player"
    @mouseenter="onMouseenterVideo"
    @mouseleave="onMouseleaveVideo"
    @click.stop="onClickMovie"
    @keydown="onKeydown"
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
    <div class="mp-loading" v-if="!state.canPlay && !state.loadIssue">
      loading...
    </div>
    <div class="mp-issue-msg" v-if="state.loadIssue">
      {{state.loadIssueMsg}}
      <button class="mp-reload-btn action button"
        @click.stop="onClickReloadButton"
      > 
        reload
      </button>
    </div>

    <transition name="fade-down">
      <div class="mp-ctrls-topleft"
        v-show="state.showCtrls && state.showSecondaryCtrls && state.isPlaying"
      >
        <div class="mp-ctrls-speed">
          <button class="mp-ctrl-btn"
            :class="{inactive:player.isAtMinSpeed}"
            @click.stop="onClickReduceSpeedButton"
          >
            <font-awesome-icon
              icon="minus-square"
            />
          </button>
          <button class="mp-ctrl-btn"
            :class="{inactive:player.isAtMinSpeed}"
            @click.stop="onClickResetSpeedButton"
          >
            <font-awesome-icon
              icon="tachometer-alt"
            />
          </button>
          <button class="mp-ctrl-btn"
            :class="{inactive:player.isAtMaxSpeed}"
            @click.stop="onClickIncreaseSpeedButton"
          >
            <font-awesome-icon
              icon="plus-square"
            />
          </button>
          <div class="mp-info-text-container">
            <span class="mp-info-text">
              ({{ player.playbackRateText }})
            </span>
          </div>
        </div>

        <div class="mp-ctrls-skip">
          <button class="mp-ctrl-btn"
            @click.stop="onClickSkipButton(-30)"
            @mouseenter="onMouseenterSkipButton(-30)"
            @mouseleave="onMouseleaveSkipButton"
          >
            <font-awesome-icon
              icon="fast-backward"
            />
          </button>
          <button class="mp-ctrl-btn"
            @click.stop="onClickSkipButton(-10)"
            @mouseenter="onMouseenterSkipButton(-10)"
            @mouseleave="onMouseleaveSkipButton"
          >
            <font-awesome-icon
              icon="step-backward"
            />
          </button>
          <button class="mp-ctrl-btn"
            @click.stop="onClickSkipButton(10)"
            @mouseenter="onMouseenterSkipButton(10)"
            @mouseleave="onMouseleaveSkipButton"
          >
            <font-awesome-icon
              icon="step-forward"
            />
          </button>
          <button class="mp-ctrl-btn"
            @click.stop="onClickSkipButton(30)"
            @mouseenter="onMouseenterSkipButton(30)"
            @mouseleave="onMouseleaveSkipButton"
          >
            <font-awesome-icon
              icon="fast-forward"
            />
          </button>
          <div v-show="player.skipTimeText" class="mp-info-text-container">
            <span class="mp-info-text">
              ({{ player.skipTimeText }})
            </span>
          </div>
        </div>
      </div>
    </transition>


    <transition name="fade-up">
      <div class="mp-ctrls-bottom"
        v-show="state.showCtrls"
      >
        <button class="mp-ctrl-btn"
          @click.stop="onClickPlayButton"
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
            {{player.timeElapsedText}}
          </span>
        </div>
        <div
          :id="source.id+'-playback-slider'"
          :ref="source.id+'-playback-slider'" 
          class="mp-ctrl-playback-slider"
          @click.stop="onClickPlaybackSlider"
          @mousedown.stop="onMousedownPlaybackSlider"
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
            {{player.timeRemainingText}}
          </span>
        </div>
        <div class="mp-ctrl-volume">
          <button
            class="mp-ctrl-btn"
            @click.stop="onClickVolumeButton"
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
            @click.stop="onClickVolumeSlider"
            @mousedown.stop="onMousedownVolumeSlider"
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
          @click.stop="onClickFullWidthButton"
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
          @click.stop="onClickFullscreenButton"
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
import { logMessage } from '@/utils/logger.js'

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
          volume: 0,
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
        percent: 0,
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
        timeRemainingText: '00:00',
        timeElapsedText: '00:00',
        playbackRateText: '1 x',
        skipTimeText: null,
        hasMousedown: false,
        domRect: null,
        pos: {
          start: 0,
          width: 0,
          innerWidth: 0,
          current: 0
        },
        isAtMaxSpeed: false,
        isAtMinSpeed: false,
      },
      tmp: {
        ctrlsDisplayTimer: null,
        isFullscreenSupported: null
      },
      state: {
        canPlay: false,
        showCtrls: false,
        showSecondaryCtrls: true,
        vol: 0.5,
        currentTime: 0,
        isFullWidth: false,
        isFullscreen: false,
        isPlaying: false,
        loadIssue: null,
        loadIssueMsg: "",
      }
    }
  },
  mounted() {
    logMessage("mount movieplayer for: " + this.source.id)
    this.init()
  },
  beforeDestroy() {
    if (this.player.playerEl) {
      this.player.playerEl.removeEventListener('mousemove', this.onMousemovePlayer)
      this.player.playerEl.removeEventListener('mouseup', this.onMouseupPlayer)
    }
    if (this.videoEl) {
      // stop any ongoing download(-attempt)s
      // by removing any source references and calling load
      const vEl = this.videoEl
      vEl.removeAttribute("src")
      while (vEl.firstChild) {
        vEl.removeChild(vEl.firstChild);
      }
      vEl.load()
    }
    logMessage("destroy movieplayer for: " + this.source.id)
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
      const vol = this.options.volume || 0
      this.volume.sliderEl = sliderEl
      this.volume.levelEl = levelEl
      this.setVolumeDimensions()
      setTimeout(() => {
        this.setVolume(vol)
      },500)
    },
    initVideo() {
      this.videoEl.addEventListener('stalled', this.onStalledVideo)
      this.videoEl.addEventListener('waiting', this.onWaitingVideo)
      this.videoEl.addEventListener('canplay', this.onCanplayVideo)
      this.videoEl.addEventListener('progress', this.onProgressVideo)
      this.videoEl.addEventListener('durationchange', this.onDurationchangeVideo)
      this.videoEl.addEventListener('timeupdate', this.onTimeupdateVideo)
      this.videoEl.addEventListener('ended', this.onEndedVideo)
      this.videoEl.addEventListener('error', this.onErrorVideo)
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
      setTimeout(() => {
        this.setPlaybackDimensions()
        this.setVolumeDimensions()
      }, 500)
    },
    onStalledVideo() {
      this.state.loadIssue = "stalled"
      const nwStates = ["EMPTY", "IDLE", "LOADING", "NO_SOURCE"]
      this.state.loadIssueMsg = "stalled... (NETWORK_" + nwStates[this.videoEl.networkState] + ")"
    },
    onWaitingVideo() {
      this.state.loadIssue = "waiting"
      this.state.loadIssueMsg = "waiting..."
    },
    onErrorVideo() {
      this.state.loadIssue = "error"
      const errNames = ["ABORTED", "NETWORK", "DECODE", "SRC_NOT_SUPPORTED"]
      this.state.loadIssueMsg = "error... (MEDIA_ERR_" + errNames[this.videoEl.error.code] + ")"
    },
    onCanplayVideo() {
      this.state.showCtrls = true
      this.state.canPlay = true
      this.state.loadIssue = null
      // advance one second to show a video frame
      this.videoEl.currentTime = 1
      this.videoEl.removeEventListener('canplay', this.onCanplayVideo)
    },
    onDurationchangeVideo() {
      if (this.player.timeRemainingText === '00:00') {
        // initialize the timeRemainingText value
        this.player.timeRemainingText = timeParse(this.videoEl.duration)
      }
    },
    onProgressVideo() {
      this.state.loadIssue = null
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
      const fraction = this.videoEl.currentTime / this.videoEl.duration
      if (this.player.pos.width === 0 || this.videoEl.currentTime < 10) this.setPlaybackDimensions()
      this.player.pos.current = (this.player.pos.width * fraction).toFixed(3)
      this.player.timeRemainingText = timeParse(this.videoEl.duration - this.videoEl.currentTime)
      this.player.timeElapsedText = timeParse(this.videoEl.currentTime)
    },
    onEndedVideo() {
      this.state.isPlaying = false
      this.player.pos.current = 0
      this.videoEl.currentTime = 0
      this.resetSpeed()
      if (this.state.isFullWidth) this.toggleFullWidth()
      if (this.state.isFullscreen) this.toggleFullScreen()
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
      if (this.state.canPlay) {
        this.showControls()
      }
    },
    onMouseleaveVideo() {
      this.hideControls(3000)
    },
    setVideoByTime(percent) {
      this.videoEl.currentTime = Math.floor(percent * this.videoEl.duration)
    },
    togglePlay() {
      if (this.videoEl) {
        this.state.isPlaying = !this.state.isPlaying
        if (this.state.isPlaying) {
          this.videoEl.play()
          this.hideControls(5000)
        } else {
          this.videoEl.pause()
        }
        this.setPlaybackDimensions()
      }
    },
    play() {
      if (this.videoEl) {
        this.videoEl.play()
        this.state.isPlaying = true
        this.hideControls(2000)
      }
    },
    reload() {
      this.videoEl.load()
      this.state.loadIssue = null
    },
    onClickReloadButton() {
      this.reload()
    },
    onClickPlayButton() {
      this.togglePlay()
    },
    onClickMovie(evt) {
      this.showControls()
      const vH3 = this.videoEl.clientHeight / 3
      const vW3 = this.videoEl.clientWidth / 3
      const eX = evt.offsetX
      const eY = evt.offsetY
      // divide video in 9x9 grid and asign actions to different sections
      if (vW3 <  eX && eX < 2*vW3 && vH3 < eY && eY < 2*vH3) {
        // center
        this.togglePlay()
      }
      if (eX < vW3) {
        // left side
        if (vH3 < eY && eY < 2*vH3) {
          // middle
          this.onClickSkipButton(1)
        }
        if (2*vH3 < eY && eY < 3*vH3) {
          // bottom
          this.onClickSkipButton(-1)
        }
      }
      if (2*vW3 <  eX && eX < 3*vW3) {
        // right side
        if (0 < eY && eY < vH3) {
          // top
          this.onClickSkipButton(30)
        }
        if (vH3 < eY && eY < 2*vH3) {
          // middle
          this.onClickSkipButton(10)
        }
        if (2*vH3 < eY && eY < 3*vH3) {
          // bottom
          this.onClickSkipButton(-10)
        }
      }
      this.hideControls(3000)
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
        if (this.volume.pos.width==0) this.setVolumeDimensions()
        this.volume.pos.current = val * this.volume.pos.width
        this.volume.percent = val * 100
        this.videoEl.volume = val
      }
    },
    onClickFullWidthButton() {
      this.toggleFullWidth()
    },
    toggleFullWidth() {
      this.$emit('toggle-fullwidth')
      this.state.isFullWidth = !this.state.isFullWidth
      this.setPlayerDimensions()
    },
    onClickFullscreenButton() {
      this.toggleFullScreen()
    },
    toggleFullScreen() {
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
      } else if (this.player.hasMousedown) {
        this.playbackSlideMove(e)
      } else if (this.state.canPlay) {
        this.showControls()
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
      const cur = this.video.playbackRate
      this.video.playbackRate = .5 * cur
      this.player.isAtMaxSpeed = false
      try {
        this.videoEl.playbackRate = this.video.playbackRate
      } catch(err) {
        //limit reached - reset previous
        this.video.playbackRate = cur
        this.player.isAtMinSpeed = true
      }
    },
    onClickIncreaseSpeedButton() {
      const cur = this.video.playbackRate
      this.video.playbackRate = 2 * cur
      this.player.isAtMinSpeed = false
      try {
        this.videoEl.playbackRate = this.video.playbackRate
      } catch(err) {
        //limit reached - reset previous
        this.video.playbackRate = cur
        this.player.isAtMaxSpeed = true
      }
    },
    resetSpeed() {
      this.videoEl.playbackRate = this.video.playbackRate = 1
      this.player.isAtMinSpeed = false
      this.player.isAtMaxSpeed = false
    },
    onClickResetSpeedButton() {
      this.resetSpeed()
    },
    skipTime(val) {
      return val * this.video.playbackRate
    },
    onClickSkipButton(val) {
      this.videoEl.currentTime += this.skipTime(val)
    },
    onMouseenterSkipButton(val) {
      const skip = this.skipTime(val)
      this.player.skipTimeText = (skip > 0 ? "+ " : "- ") + Math.abs(skip) + " sec"
    },
    onMouseleaveSkipButton() {
      this.player.skipTimeText = null
    },
    onKeydown(evt) {
      if (evt.isComposing || evt.keyCode === 229) {
        return
      }
      if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
        if (evt.key===" ") {
          this.togglePlay()
        }
        if (evt.key===".") {
          this.onClickSkipButton(1)
        }
        if (evt.key===",") {
          this.onClickSkipButton(-1)
        }
        if (evt.key==="ArrowRight") {
          this.onClickSkipButton(10)
        }
        if (evt.key==="ArrowLeft") {
          this.onClickSkipButton(-10)
        }
        if (evt.key==="-" || evt.key==="[") {
          this.onClickReduceSpeedButton()
        }
        if (evt.key==="]") {
          this.onClickIncreaseSpeedButton()
        }
        if (evt.key==="=") {
          this.resetSpeed()
        }
      }
      if (evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
        if (evt.key==="ArrowRight") {
          this.onClickSkipButton(30)
        }
        if (evt.key==="ArrowLeft") {
          this.onClickSkipButton(-30)
        }
      }
      if (!evt.ctrlKey && !evt.altKey && evt.shiftKey) {
        if (evt.key==="+") {
          this.onClickIncreaseSpeedButton()
        }
      }
      if (evt.key!=="Escape") {
        evt.preventDefault()
        evt.stopPropagation()
      }
    }
  },
  computed: {
    playbackRate() {
      // define this computed property just so we can watch it
      return this.video.playbackRate
    }
  },
  watch: {
    playbackRate(val) {
      const pbr = val
      this.player.playbackRateText = (pbr >=1 ? pbr : '1/' + 1/pbr)  + ' x'
    }
  },
}
</script>

<style lang="less">
.mp-video-player {
  position: relative;
  width: 100%;
  background-color: #000;
  font-size: 14px;
}

.mp-video {
  width: 100%;
  height: 100%;
  vertical-align: bottom;
  max-height: 100vh;
}

.mp-issue-msg,
.mp-loading {
  position: absolute;
  bottom: 3em;
  left: 3em;
  color: #ffa04c;
  font-style: italic;
}
.mp-issue-msg {
  bottom: 2em;
  color: #ff1313;
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
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.54);
  z-index: 3;
  padding-right: .7em;
}
.mp-ctrls-speed,
.mp-ctrls-skip {
    display: flex;
    .mp-info-icon {
      height: 1.5em;
    }
}
.mp-ctrls-speed {
  .svg-inline--fa.fa-w-14.fa-tachometer-alt,
  .svg-inline--fa.fa-w-14.fa-minus-square,
  .svg-inline--fa.fa-w-14.fa-plus-square {
    width: 1.25em;
    height: 1.25em;
  }
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
.mp-ctrl-btn.inactive {
  cursor: default;
  opacity: .3;
}
.mp-ctrl-btn:not(.inactive):hover {
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
