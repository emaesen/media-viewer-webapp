<template>
  <div :class="['movie-container', {'full-width': isFullWidth}]">

    <div class="sub-container">
      <div class="actions" v-if="!isFullWidth">
        <div class="hide" v-if="showHideButton && !movie.hidden">
          <font-awesome-icon icon="eye-slash" @click="onClickHideMovie"/>
        </div>
        <div class="unhide" v-if="movie.hidden">
          <font-awesome-icon icon="eye" @click="onClickUnhideMovie"/>
        </div>
        <div class="remove" v-if="movie.hidden">
          <font-awesome-icon icon="trash-alt" @click="onClickRemoveMovie"/>
        </div>
      </div>
      <div class="rating">
        <Rating
          :rating="movieRating"
          @set-rating="onSetRating"
        />
      </div>
      <div class="path info">
        {{ moviePath }}
      </div>
      <div v-if="movieMarkers" class="markers info">
        {{ movieMarkers }}
        <font-awesome-icon
          icon="arrow-circle-down"
        />
      </div>
      <div class="title info">
        {{ movieTitle }}
      </div>
      <MoviePlayer 
        v-if="embedPlayer"
        class="movie" 
        :source="{
          src:movieSrc, 
          type:mimeType, 
          id:movie._id, 
          startFlagTime:startFlagTime, 
          resumeTime:resumeTime, 
          markers:movie.markers
        }"
        :hasCustomStartFlagTime="hasCustomStartFlagTime"
        :options="options"
        @toggle-fullwidth="onToggleFullWidth"
        @set-startflagtime="onSetStartFlagTime"
        @set-markers="onSetMarkers"
        @set-watchedat="onSetWatchedAt"
        @set-resumetime="onSetResumeTime"
      />
      <div v-if="!embedPlayer">
        <button class="action button"
          @click.stop="embedPlayer = true"
        >
          embed player
        </button>
      </div>
      <div class="meta info">
        {{ movieSize }} &nbsp; &nbsp; {{ movieDimensions }} &nbsp; &nbsp; {{ movieDuration }} &nbsp; &nbsp; qf={{ movieQuality }}<br>
        {{ movieLastWatchedDate }} &nbsp; {{ movieRNR }} &nbsp; {{ eqFlags }}
      </div>
      <div v-if="movie.hidden" class="cmd-rm info">
        rm -i {{movie.path}}
      </div>
    </div>
  </div>
</template>

<script>
import Rating from "@/components/Rating";
import MoviePlayer from "@/components/MoviePlayer";
import { logMessage } from '@/utils/logger.js'

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
  name:"MovieContainer",
  props: ['movie', 'isActive', 'showHideButton', 'autoEmbedPlayer'],
  components: {
    Rating,
    MoviePlayer
  },
  data() {
    return {
      isFullWidth: false,
      embedPlayer: false,
      startFlagTimeDefault: 1,
      options: {
        autoplay:false,
        volume:.69,
      }
    }
  },
  mounted() {
    logMessage("mount movie-container for: " + this.movie._id)
    this.embedPlayer = this.isActive && this.autoEmbedPlayer
  },
  beforeDestroy() {
    logMessage("destroy movie-container for: " + this.movie._id)
  },
  computed: {
    movieSrc() {
      return this.movie.ui.src
    },
    mimeType() {
      return this.movie.mime || "video/mp4"
    },
    movieTitle() {
      return this.movie.basename.replace(".mp4","").replace(/[-_]/g, " ")
    },
    movieMarkers() {
      let nrMarkers = this.movie.markers && this.movie.markers.length > 0 ? this.movie.markers.length : 0
      return nrMarkers
    },
    movieSize() {
      return Math.round(this.movie.meta.sizeInMB) + " MB"
    },
    movieDimensions() {
      return this.movie.meta.width + "⨯" + this.movie.meta.height
    },
    movieDuration() {
      return timeParse(this.movie.meta.durationInSec)
    },
    movieRNR() {
      return this.movie.rnr
    },
    movieLastWatchedDate() {
      const options = { dateStyle: "short" };
      return this.movie.watchedAt ? new Date(this.movie.watchedAt).toLocaleDateString('en-US', options) : "---"
    },
    movieLastWatchedTime() {
      const options = { dateStyle: "short", timeStyle: "short", hour12: false };
      return this.movie.watchedAt ? new Date(this.movie.watchedAt).toLocaleString('en-US', options) : "---"
    },
    moviePath() {
      let levels =  this.movie.level1 
        + (this.movie.level2!=="-" ? "/" + this.movie.level2 : "")
      return levels
    },
    movieQuality() {
      return this.movie.ui.qf
    },
    movieRating() {
      return this.movie.rating
    },
    startFlagTime() {
      return this.movie.sft == 0 ? 0 : this.movie.sft || this.startFlagTimeDefault
    },
    resumeTime() {
      return this.movie.rt
    },
    eqFlags() {
      return (this.movie.eqd? "eqd":this.movie.eqn?"&":"") + (this.movie.eqn? "eqn":"")
    },
    hasCustomStartFlagTime() {
      return this.movie.sft !== null && this.movie.sft >= 0 && this.movie.sft !== this.startFlagTimeDefault
    }
  },
  methods: {
    onToggleFullWidth() {
      this.$emit('toggle-fullwidth')
      this.isFullWidth = !this.isFullWidth
      if (this.isFullWidth) {
        // not sure why I had this, commenting out for now
        // because it causes slight misalignment issue when
        // exiting fullwidth mode
        //this.$el.scrollIntoView({behavior: "smooth"})
      }
    },
    updateMovie(payload) {
      this.$emit('update-movie', payload)
    },
    onSetRating(i) {
      this.updateMovie({movie:this.movie, prop:"rating", val:i})
    },
    onSetStartFlagTime(sft) {
      this.updateMovie({movie:this.movie, prop: "sft", val: sft})
    },
    onSetMarkers(markers) {
      this.updateMovie({movie:this.movie, prop:"markers", val:markers})
    },
    onSetWatchedAt(watchedAt) {
      const rnr = Math.round(Math.random()/Math.max(Math.random(), 0.01)*1e5)
      this.updateMovie({movie:this.movie, prop:"watchedAt", val:watchedAt})
      this.updateMovie({movie:this.movie, prop:"rnr", val:rnr})
    },
    onSetResumeTime(rt) {
      if (rt === this.startFlagTimeDefault) {
        rt = null
      }
      rt = rt ? (1*rt).toFixed(2) : null
      this.updateMovie({movie:this.movie, prop:"rt", value:rt})
    },
    onClickHideMovie() {
      this.$emit('hide-movie', {movie:this.movie})
    },
    onClickUnhideMovie() {
      this.$emit('unhide-movie', {movie:this.movie})
    },
    onClickRemoveMovie() {
      this.$emit('remove-movie', {movie:this.movie})
    },
  },
  watch: {
    isActive(newVal) {
      this.embedPlayer = newVal && this.autoEmbedPlayer
      logMessage("embedPlayer", this.embedPlayer, this.movie.basename)
    },
    autoEmbedPlayer(newVal) {
      this.embedPlayer = this.isActive && newVal
    }
  }
}
</script>

<style lang="less" scoped>
.movie-container {
  padding: 5px 5px 5px;
}
.movie-container.full-width {
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000;
  z-index: 9999;
  max-height: 100vh;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  .sub-container {
    flex-grow: 1;
    max-height: 100vh;
    margin:0;
  }
  .info {
    margin:0;
    display: none;
    height: 0;
  }
  .rating,
  .title.info {
    display: block;
    height: auto;
    position: absolute;
    top: 0px;
    left: 140px;
    background-color: rgba(0, 0, 0, 0.54);
    z-index: 5;
    padding: 0 .5em;
    color:rgb(178, 157, 228);
  }
  .rating {
    left: auto;
    right: 80px;
    min-width: 145px;
  }
}
.actions {
  float: right;
}
.remove,
.unhide,
.hide {
  display: inline-block;
  cursor: pointer;
  svg {
    color: rgba(190, 29, 0, 0.747);
  }
  svg:hover {
    color: rgb(253, 38, 0);
  }
}
.unhide {
  svg {
    color: rgba(111, 151, 0, 0.952);
  }
  svg:hover {
    color: rgb(122, 253, 0);
  }
}
.remove {
  margin: 0 0 0 1em
}
.path,
.title,
.markers {
  margin: 1px 0 2px 0;
}
.title {
  color: #90d9f5;
}
.path {
  text-align: right;
}
.markers {
  float: right;
  margin: 0;
  svg {
    opacity: .5;
  }
}

.movie {
  width: 100%;
  max-height: 100vh;
  border: 1px solid rgb(108, 108, 108);
}
.fullview.movie {
  border: none;
}
.meta.info {
  font-size: 80%;
  text-align: center;
  margin-top: 1em;
}
.cmd-rm {
  text-align: center;
  margin-top: 1em;
  font-size:50%;
  color: #f90;
}
</style>