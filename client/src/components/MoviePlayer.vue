<template>
  <div
    :id="source.id+'-container'"
    :ref="source.id+'-container'"
    class="mp-video-container"
    @mouseenter="onMouseenterVideo"
    @mouseleave="onMouseleaveVideo"
  >
    <video
      :id="source.id+'-video'"
      :ref="source.id+'-video'"
      :class="['mp-video', {'hide-cursor': !state.showCtrls}]"
      :preload="options.preload"
    >
      <source
        :src="source.src"
        :type="source.type"
      />
    </video>
    <transition name="fade">
      <div class="mp-ctrls"
        v-show="state.showCtrls"
      >
        <button class="mp-ctrl-btn"
          @click="onClickPlayButton"
        >
          <font-awesome-icon
            v-show="!state.isPlaying"
            icon="play"
          />
          <font-awesome-icon
            v-show="state.isPlaying"
            icon="pause"
          />
        </button>
        <div class="mp-video-time">
          <span class="mp-video-time-text">
            {{video.displayTimeElapsed}}
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
            :style="{'transform': 'translateX('+video.pos.current+'px)'}"
          ></div>
          <div class="mp-playback-rail">
            <div
              class="mp-playback-rail-loaded"
              :style="{'transform': 'translateX('+video.loaded+'%)'}"
            ></div>
          </div>
        </div>
        <div class="mp-video-time">
          <span class="mp-video-time-text">
            {{video.displayTimeRemaining}}
          </span>
        </div>
        <div class="mp-ctrl-volume">
          <button
            class="mp-ctrl-btn"
            @click="onClickVolumeButton"
          >
            <font-awesome-icon
              v-show="volume.percent >= 50 && !volume.muted"
              icon="volume-up"
            />
            <font-awesome-icon
              v-show="volume.percent < 50 && !volume.muted"
              icon="volume-down"
            />
            <font-awesome-icon
              v-show="volume.muted"
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
          @click="onClickResizeButton"
        >
          <font-awesome-icon icon="expand-arrows-alt"/>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
const getMousePosition = function (e, type = 'x') {
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
  props: {
    source: Object,
    options: {
      type: Object,
      default () {
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
  data () {
    return {
      videoEl: null,
      video: {
        playbackSliderEl: null,
        len: 0,
        current: 0,
        loaded: 0,
        isChanging: false,
        displayTimeRemaining: '00:00',
        displayTimeElapsed: '00:00',
        pos: {
          start: 0,
          width: 0,
          innerWidth: 0,
          current: 0
        },
        isListeningTo: {
          durationchange: false,
          progress: false,
          timeupdate: false,
          ended: false,
        }
      },
      volume: {
        volumeSliderEl: null,
        muted: false,
        percent: 60,
        isChanging: false,
        pos: {
          start: 0,
          width: 0,
          innerWidth: 0,
          current: 0
        }
      },
      player: {
        playerEl: null,
        pos: null
      },
      tmp: {
        ctrlsDisplayTimer: null
      },
      state: {
        showCtrls: true,
        vol: 0.5,
        currentTime: 0,
        isFullScreen: false,
        isPlaying: false
      }
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.player.playerEl.removeEventListener('mousemove', this.onMousemovePlayer)
    this.player.playerEl.removeEventListener('mouseup', this.onMouseupPlayer)
  },
  methods: {
    init () {
      this.videoEl = this.$refs && this.$refs[this.source.id+'-video']
      //console.log({video: this.videoEl})
      this.initCore()
      if (this.options.autoplay) {
        this.togglePlay()
      }
      this.player.playerEl.addEventListener('mousemove', this.onMousemovePlayer, false)
      this.player.playerEl.addEventListener('mouseup', this.onMouseupPlayer, false)
    },
    initCore () {
      this.initVol()
      this.initVideo()
      this.initPlayer()
      const vol = this.options.volume || 0.9
      this.setVol(vol)
    },
    initPlayer () {
      const playerEl = this.$refs && this.$refs[this.source.id+'-container']
      this.player.pos = playerEl.getBoundingClientRect()
      this.player.playerEl = playerEl
    },
    initVol () {
      const volumeSliderEl = this.$refs && this.$refs[this.source.id+'-vol-slider']
      const volumeLevelEl = this.$refs && this.$refs[this.source.id+'-vol-level']
      this.volume.volumeSliderEl = volumeSliderEl
      this.volume.pos.innerWidth = volumeLevelEl.getBoundingClientRect().width
      this.volume.pos.start = volumeSliderEl.getBoundingClientRect().left
      this.volume.pos.width = volumeSliderEl.getBoundingClientRect().width - this.volume.pos.innerWidth
    },
    initVideo () {
      const playbackSliderEl = this.$refs && this.$refs[this.source.id+'-playback-slider']
      const playbackHeadEl = this.$refs && this.$refs[this.source.id+'-playback-head']
      this.playbackSliderEl = playbackSliderEl
      this.video.pos.start = playbackSliderEl.getBoundingClientRect().left
      this.video.pos.innerWidth = playbackHeadEl.getBoundingClientRect().width
      this.video.pos.width = playbackSliderEl.getBoundingClientRect().width - this.video.pos.innerWidth
      this.getTime()
    },
    onMouseenterVideo () {
      if (this.tmp.ctrlsDisplayTimer) {
        clearTimeout(this.tmp.ctrlsDisplayTimer)
        this.tmp.ctrlsDisplayTimer = null
      }
      this.state.showCtrls = true
    },
    onMouseleaveVideo (e) {
      if (this.tmp.ctrlsDisplayTimer) {
        clearTimeout(this.tmp.ctrlsDisplayTimer)
      }
      this.tmp.ctrlsDisplayTimer = setTimeout(() => {
        this.state.showCtrls = false
        this.tmp.ctrlsDisplayTimer = null
      }, 3000)
    },
    toggleContrlShow () {
      this.state.showCtrls = !this.state.showCtrls
    },
    getTime () {
      if(!this.video.isListeningTo.durationchange) {
        this.videoEl.addEventListener('durationchange', (e) => {
          if (this.video.displayTimeRemaining === '00:00') {
            // initialize the displayTimeRemaining value
            this.video.displayTimeRemaining = timeParse(this.videoEl.duration)
          }
        })
        this.video.isListeningTo.durationchange = true
      }
      if(!this.video.isListeningTo.progress) {
        this.videoEl.addEventListener('progress', (evt) => {
          if (this.videoEl.readyState===4) {
            this.video.loaded = (-1 + (this.videoEl.buffered.end(0) / this.videoEl.duration)) * 100
          }
        })
        this.video.isListeningTo.progress = true
      }
      this.video.len = this.videoEl.duration
    },
    setVideoByTime (percent) {
      this.videoEl.currentTime = Math.floor(percent * this.video.len)
    },
    togglePlay() {
      this.state.isPlaying = !this.state.isPlaying
      if (this.videoEl) {
        if (this.state.isPlaying) {
          this.videoEl.play()
          this.onMouseleaveVideo()
          if(!this.video.isListeningTo.timeupdate) {
            this.videoEl.addEventListener('timeupdate', this.timeline)
            this.video.isListeningTo.timeupdate = true
          }
          if(!this.video.isListeningTo.ended) {
            this.videoEl.addEventListener('ended', (e) => {
              this.state.isPlaying = false
              this.video.pos.current = 0
              this.videoEl.currentTime = 0
            })
            this.video.isListeningTo.ended = true
          }
        } else {
          this.videoEl.pause()
        }
      }
    },
    timeline () {
      const percent = this.videoEl.currentTime / this.videoEl.duration
      this.video.pos.current = (this.video.pos.width * percent).toFixed(3)
      this.video.displayTimeRemaining = timeParse(this.videoEl.duration - this.videoEl.currentTime)
      this.video.displayTimeElapsed = timeParse(this.videoEl.currentTime)
    },
    onClickPlayButton() {
      this.togglePlay()
    },
    onMousedownVolumeSlider (e) {
      this.initVol()
      this.volume.isChanging = true
    },
    onMousedownPlaybackSlider (e) {
      this.initVideo()
      this.video.isChanging = true
    },
    onClickPlaybackSlider (e) {
      this.videoSlideMove(e)
    },
    onClickVolumeSlider (e) {
      this.volSlideMove(e)
    },
    onClickVolumeButton () {
      this.videoEl.muted = !this.videoEl.muted
      this.volume.muted = this.videoEl.muted
    },
    setVol (val) {
      if (this.videoEl) {
        this.volume.pos.current = val * this.volume.pos.width
        this.volume.percent = val * 100
        this.videoEl.volume = val
      }
    },
    onClickResizeButton () {
      if (this.videoEl.RequestFullScreen) {
        if (!this.state.isFullScreen) {
          this.state.isFullScreen = true
          this.videoEl.RequestFullScreen()
        } else {
          this.state.isFullScreen = false
          document.CancelFullScreen()
        }
        setTimeout(this.initVideo, 200)
      }
    },
    onMousemovePlayer (e) {
      if (this.volume.isChanging) {
        this.volSlideMove(e)
      }
      if (this.video.isChanging) {
        this.videoSlideMove(e)
      }
      this.ctrlHider(e)
    },
    ctrlHider (e) {
      const x = getMousePosition(e, 'x')
      const y = getMousePosition(e, 'y')
      if (!this.player.pos) return
      if (x > this.player.pos.left &&
        x < this.player.pos.left + this.player.pos.width
      ) {
        if (
          y > this.player.pos.top + this.player.pos.height * 0.6 &&
          y < this.player.pos.top + this.player.pos.height
        ) {
          return this.onMouseenterVideo()
        }
      }
      return this.onMouseleaveVideo()
    },
    volSlideMove (e) {
      const x = getMousePosition(e) - this.volume.pos.start
      if (x > 0 && x < this.volume.pos.width) {
        this.setVol(x / this.volume.pos.width)
      }
    },
    videoSlideMove (e) {
      const x = getMousePosition(e) - this.video.pos.start
      if (x > 0 && x < this.video.pos.width) {
        this.video.pos.current = x
        this.setVideoByTime(x / this.video.pos.width)
      }
    },
    onMouseupPlayer (e) {
      this.volume.isChanging = false
      this.video.isChanging = false
    }
  }
}
</script>

<style>
.mp-video-container {
  position: relative;
  width: 100%;
  background-color: #000;
}

.mp-video {
  width: 100%;
  height: 100%;
  vertical-align: bottom;
}

.mp-ctrls {
  position: absolute;
  display: flex;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.54);
  height: 2rem;
  width: 100%;
  z-index: 3;
}
.mp-ctrl-btn {
  position: relative;
  height: 100%;
  background: none;
  border: none;
  height: 2rem;
  width: 2rem;
  outline: none;
  vertical-align: top;
}
.mp-ctrl-btn:hover {
  background-color: rgba(255, 255, 255, 0.27);
}
.mp-ctrl-btn-icon {
  position: absolute;
  height: 1rem;
  width: 1rem;
  top: 50%;
  left: 50%;
  margin-top: -.5rem;
  margin-left: -.5rem;
}
.mp-ctrl-vol-btn-icon {
  position: absolute;
  height: 1.1rem;
  width: 1.1rem;
  top: 50%;
  left: 50%;
  margin-top: -.55rem;
  margin-left: -.55rem;
}
.mp-ctrl-vol-slider {
  position: relative;
  display: inline-block;
  height: 100%;
  width: 2rem;
  height: 2rem;
  overflow: hidden;
  transition: all .2s ease-in;
}
.mp-ctrl-vol-rail {
  position: absolute;
  top: 50%;
  width: 2rem;
  height: .1rem;
  margin-top: -.05rem;
  background: #cec0a1;
}
.mp-ctrl-vol-level {
  position: absolute;
  display: inline-block;
  left: 0;
  top: 50%;
  background: #cec0a1;
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  margin-top: -.25rem;
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
  margin: 0 .5rem;
  transition: all .2s ease-in;
}
.mp-playback-rail {
  position: absolute;
  top: 50%;
  width: 100%;
  height: .1rem;
  margin-top: -.05rem;
  background: #cec0a150;
  overflow: hidden;
}
.mp-playback-rail-loaded {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: .1rem;
  background: #cec0a1;
  transition: transform .2s;
}
.mp-playback-head {
  position: absolute;
  display: inline-block;
  left: 0;
  top: 50%;
  background: #cec0a1;
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  margin-top: -.25rem;
  z-index: 2;
  cursor: pointer;
  transition: all 16ms;
}
.mp-video-time {
  padding: 0;
}
.mp-video-time-text {
  color: #cec0a1;
  line-height: 2rem;
  font-size: .8rem;
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease-in-out, transform 0.4s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(9px);
}

.hide-cursor {
  cursor: none;
}
</style>
