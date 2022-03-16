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

    <transition name="fade-down">
      <div class="mp-ctrls-topright"
        v-show="state.showCtrls && state.showSecondaryCtrls && (state.
        isFullWidth || state.isFullscreen)"
      >
        <div class="mp-ctrls-flags">
          <button class="mp-ctrl-btn"
            @click.stop="onClickStartFlagButton"
          >
            <font-awesome-icon
              :class="{activated:player.highlightFlagCtrl}"
              icon="flag-checkered"
            />
          </button>
        </div>
        <div class="mp-ctrls-markers">
          <button class="mp-ctrl-btn"
            @click.stop="onClickMarkersCtrl"
          >
            <font-awesome-icon
              :class="{activated:player.highlightMarkerCtrl}"
              icon="arrow-circle-down"
            />
          </button>
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

          <div v-show="isInFullView && state.hasCustomStartFlagTime">
            <button 
              :id="source.id+'-playback-startflag-marker'"
              :ref="source.id+'-playback-startflag-marker'"
              class="mp-ctrl-btn mp-playback-marker"
              :style="{'transform': 'translateX('+player.startFlagMarkerPos+'px)','opacity' : 1}"
              @click.stop="onClickMarker(player.startFlagTime)"
            >
              <font-awesome-icon
                icon="flag-checkered"
              />
            </button>
          </div>

          <div v-show="isInFullView">
            <span v-for="(markerTime,index) in player.markers" :key="index">
              <button
                :id="source.id+'-playback-marker-'+index"
                :ref="source.id+'-playback-marker-'+index"
                class="mp-ctrl-btn mp-playback-marker"
                :style="{'transform': 'translateX('+player.markersPos[index]+'px)','opacity' : player.markersOpacity}"
                @click.stop="onClickMarker(markerTime)"
                @mousedown.stop="onMousedownMarker"
                @dragstart.stop="onDragstartMarker"
                @dragend.stop="OnDragendMarker"
                draggable="true"
                :data-index="index"
              >
                <font-awesome-icon 
                  icon="arrow-circle-down"
                />
              </button>
            </span>
          </div>

          <div v-if="state.showDeleteMarkerTarget"
            class="mp-target-deletemarker"
            @drop.prevent="onDropDeleteMarkersTarget"
            @dragover.prevent="OnDragoverDeleteMarkersTarget"
          >
             <font-awesome-icon 
                icon="trash-alt"
              />
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
    },
    hasCustomStartFlagTime: Boolean
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
        startFlagTime: 0,
        startFlagMarkerPos: 0,
        startFlagMarkerEl: null,
        startTime: 0,
        resumeTime: null,
        markers:[],
        markerEls:[],
        markersPos:[],
        markersOpacity:0,
        highlightFlagCtrl: false,
        highlightMarkerCtrl: false,
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
        hasCustomStartFlagTime: false,
        resumeFractionThreshold: 0.95,
        hasNewResumeTime: false,
        showDeleteMarkerTarget: false,
      }
    }
  },
  mounted() {
    logMessage("mount movieplayer for: " + this.source.id)
    this.init()
  },
  beforeDestroy() {
    this.setResumeTime()
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
      this.supportsVideo = this.videoEl.canPlayType
      this.player.startFlagTime = this.source.startFlagTime
      this.player.resumeTime = this.source.resumeTime
      this.player.startTime = this.source.resumeTime || this.source.startFlagTime
      this.state.hasCustomStartFlagTime = this.hasCustomStartFlagTime
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
      const startFlagMarkerEl = this.$refs && this.$refs[this.source.id+'-playback-startflag-marker']

      this.player.domRect = playerEl.getBoundingClientRect()
      this.player.playerEl = playerEl
      this.player.playbackSliderEl = playbackSliderEl
      this.player.playbackHeadEl = playbackHeadEl
      this.player.startFlagMarkerEl = startFlagMarkerEl

      this.player.playerEl.addEventListener('mousemove', this.onMousemovePlayer, false)
      this.player.playerEl.addEventListener('mouseup', this.onMouseupPlayer, false)
      this.setPlaybackDimensions()
      this.initVolume()
      this.initPlaybackMarkers()
      this.displayPlaybackMarkers()
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
      // fake a time update event to ensure proper position of play head
      this.onTimeupdateVideo({preventSetPlaybackDimensions: true})
    },
    setPlayerDimensions() {
      setTimeout(() => {
        this.setPlaybackDimensions()
        this.setVolumeDimensions()
        this.displayPlaybackMarkers()
      }, 500)
    },
    initPlaybackMarker(marker) {
      this.player.markers.push(marker)
      const i = this.player.markers.length - 1
      this.player.markersPos[i]=0.001
      this.$nextTick(() => {
        this.player.markerEls[i] = this.$refs && this.$refs[this.source.id+'-playback-marker-'+i][0]
      })
    },
    removePlaybackMarker(index) {
      this.player.markers.splice(index,1)
      this.player.markersPos.splice(index,1)
      this.player.markerEls.splice(index,1)

    },
    initPlaybackMarkers() {
      this.player.markersOpacity = 0
      if (this.source.markers && this.source.markers.length > 0) {
        this.source.markers.forEach(marker => {
          this.initPlaybackMarker(marker)
        })
      }
    },
    displayPlaybackMarkers() {
      this.player.markersOpacity = 0
      if (this.player.markers && this.player.markers.length > 0) {
        this.$nextTick(() => {
          this.positionStartFlagMarker()
          this.player.markers.forEach((marker,i) => {
            const markerWidth = this.player.markerEls[i].getBoundingClientRect().width
            const fraction = (marker / this.videoEl.duration).toFixed(3)
            // use splice to modify array so that vue will pick up the changes
            this.player.markersPos.splice(i,1,(this.player.pos.width * fraction - markerWidth/2 + 3).toFixed(1))
            if(this.isInFullView) {
              this.player.markersOpacity = 1
              logMessage("display playback marker", {i, marker, fraction, pos:this.player.markersPos[i] })
            }
          })
        })
      }
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
      // advance startTime seconds to show a video frame
      logMessage("start video " + this.source.id + " at " + this.player.startTime + " seconds")
      this.videoEl.currentTime = this.player.startTime
      this.videoEl.removeEventListener('canplay', this.onCanplayVideo)
      this.setPlaybackDimensions()
      this.displayPlaybackMarkers() 
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
    onTimeupdateVideo(opts) {
      const fraction = this.videoEl.currentTime / this.videoEl.duration
      if ( !opts.preventSetPlaybackDimensions && (this.player.pos.width === 0 || this.videoEl.currentTime <= this.player.startTime + 1) ) this.setPlaybackDimensions()
      this.player.pos.current = (this.player.pos.width * fraction).toFixed(3)
      this.player.timeRemainingText = timeParse(this.videoEl.duration - this.videoEl.currentTime)
      this.player.timeElapsedText = timeParse(this.videoEl.currentTime)
      if (this.isInFullView) {
        if ( fraction > (1 - this.state.resumeFractionThreshold)
            && fraction < this.state.resumeFractionThreshold) {
          this.player.resumeTime = this.videoEl.currentTime
          this.state.hasNewResumeTime = true
        } else if (fraction >= this.state.resumeFractionThreshold) {
          this.player.resumeTime = null
        }
      }
    },
    onEndedVideo() {
      this.state.isPlaying = false
      this.videoEl.currentTime = this.player.startFlagTime
      this.resetSpeed()
      if (this.state.isFullWidth) this.toggleFullWidth()
      if (this.state.isFullscreen) this.toggleFullScreen()
      this.setResumeTime()
      this.setWatchedAt()
    },
    setWatchedAt() {
      // update watchedAt after 10 seconds, because movie
      // could be in "sort by date watched" mode and we allow
      // some time to set a rating
      setTimeout(() => {
        this.$emit('set-watchedat', Date.now())
      }, 10 * 1000)
    },
    setResumeTime() {
      if (this.state.hasNewResumeTime) {
        logMessage("set resume time to ", this.player.resumeTime)
        this.$emit('set-resumetime', this.player.resumeTime)
        this.state.hasNewResumeTime = false
      }
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
      // divide video in 3x3 grid and assign actions to 
      // 9 different hotspot sections:
      if (eX < vW3) {
        // left column
        if (0 < eY && eY < vH3) {
          // top
          this.onClickSkipButton(-30)
        }
        if (vH3 < eY && eY < 2*vH3) {
          // middle
          this.onClickSkipButton(-10)
        }
        if (2*vH3 < eY && eY < 3*vH3) {
          // bottom
          this.onClickSkipButton(-1)
        }
      }
      if (vW3 <  eX && eX < 2*vW3) {
        // center column
        if (0 < eY && eY < vH3) {
          // top
          this.onClickIncreaseSpeedButton()
        }
        if (vH3 < eY && eY < 2*vH3) {
          // middle
          this.togglePlay()
        }
        if (2*vH3 < eY && eY < 3*vH3) {
          // bottom
          this.onClickReduceSpeedButton()
        }
      }
      if (2*vW3 <  eX && eX < 3*vW3) {
        // right column
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
          this.onClickSkipButton(1)
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
    onClickVolumeUpButton() {
      let vol = this.videoEl.volume
      vol = vol < .1 ? vol + .01 : 
            vol < .2 ? vol + .05 : 
                       vol + .1
      vol = vol > 1 ? 1 : vol
      this.setVolume(vol)
    },
    onClickVolumeDownButton() {
      let vol = this.videoEl.volume
      vol = vol < .1 ? vol - .01 : 
            vol < .2 ? vol - .05 : 
                       vol - .1
      vol = vol < 0 ? 0 : vol
      this.setVolume(vol)
    },
    onClickFullWidthButton() {
      this.toggleFullWidth()
    },
    toggleFullWidth() {
      if (this.state.isFullWidth) {
        // exiting fullwidth mode
        this.setResumeTime()
      }
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
        this.setResumeTime()
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
    positionStartFlagMarker() {
      if (this.state.hasCustomStartFlagTime) {
        const markerWidth = this.player.startFlagMarkerEl.getBoundingClientRect().width
        const sft = this.player.startFlagTime
        const fraction = (sft / this.videoEl.duration).toFixed(3)
        this.player.startFlagMarkerPos = (this.player.pos.width * fraction - markerWidth/2 + 3).toFixed(1)
      
        logMessage("display startflag playback marker", {sft, fraction, pos:this.player.startFlagMarkerPos })
      }
    },
    onClickStartFlagButton() {
      this.player.startFlagTime = this.videoEl.currentTime
      this.positionStartFlagMarker()
      this.$emit('set-startflagtime', this.player.startFlagTime)
      this.state.hasCustomStartFlagTime = true
      this.player.highlightFlagCtrl = true
      setTimeout(() => {
        this.player.highlightFlagCtrl = false
      },2700)
    },
    onClickMarkersCtrl() {
      const marker = Math.round(100 * this.videoEl.currentTime) / 100
      logMessage("set marker at ", marker + " sec")
      // initialize new marker
      this.initPlaybackMarker(marker)
      this.$emit('set-markers', this.player.markers)
      // display new (and pre-existing) markers
      this.displayPlaybackMarkers()
      this.player.highlightMarkerCtrl = true
      setTimeout(() => {
        this.player.highlightMarkerCtrl = false
      },2700)
    },
    onMousedownMarker() {
      // this handler's only reason of existence is to stop 
      // event propagation in case a marker drag is initiated
    },
    onDragstartMarker(evt) {
      evt.dataTransfer.setData("text/plain", evt.target.dataset.index)
      evt.dataTransfer.effectAllowed = "move"
      this.state.showDeleteMarkerTarget = true
    },
    OnDragendMarker() {
      this.state.showDeleteMarkerTarget = false
    },
    OnDragoverDeleteMarkersTarget(evt) {
      // this handler's reason of existence is to indicate a valid
      // drop target by calling the event's preventDefault method
      evt.dataTransfer.dropEffect = "move"
    },
    onDropDeleteMarkersTarget(evt) {
      const index = evt.dataTransfer.getData("text/plain")
      logMessage("remove marker ", (1*index+1))
      this.removePlaybackMarker(index)
      this.$emit('set-markers', this.player.markers)
    },
    onClickMarker(markerTime) {
      this.videoEl.currentTime = markerTime
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
        if (evt.key==="ArrowUp") {
          this.onClickVolumeUpButton()
        }
        if (evt.key==="ArrowDown") {
          this.onClickVolumeDownButton()
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
        if (evt.key==="m") {
          this.onClickMarkersCtrl()
        }
        if (evt.key==="s") {
          this.onClickStartFlagButton()
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
    },
    isInFullView() {
      return this.state.isFullWidth || this.state.isFullscreen 
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
.mp-ctrls-topleft,
.mp-ctrls-topright {
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.54);
  z-index: 3;
  padding-right: .7em;
}
.mp-ctrls-topright {
  left: auto;
  right: 0;
  padding-left: .7em;
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
  //overflow: hidden;
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
.mp-playback-marker {
  position: absolute;
  display: inline-block;
  left: 0;
  top: -70%;
  background-color: rgba(0, 0, 0, 0.418);
  cursor: pointer;
  opacity: 0;
  transition: opacity 900ms;
}
.mp-target-deletemarker {
  position: absolute;
  display: inline-block;
  left: 0;
  top: -360%;
  right: 0;
  padding: .7em;
  background-color: rgba(175, 40, 18, 0.5);
  transition: all 300ms;
  text-align: center;
  svg {
    color: rgb(255, 38, 0);
  }
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
