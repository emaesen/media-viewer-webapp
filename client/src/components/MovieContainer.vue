<template>
  <div :class="['movie-container', {'full-width': isFullWidth}]">

    <div class="sub-container">
      <div class="actions">
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
        {{ movieSize }} &nbsp; &nbsp; {{ movieDimensions }} &nbsp; &nbsp; {{ movieDuration }}<br>
        {{ movieLastWatchedTime }} &nbsp; &nbsp; {{ movieRNR }}
      </div>
    </div>
  </div>
</template>

<script>
import Rating from "@/components/Rating";
import MoviePlayer from "@/components/MoviePlayer";

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
  props: ['movie', 'isActive', 'showHideButton'],
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
    this.embedPlayer = this.isActive
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
    movieLastWatchedTime() {
      const options = { dateStyle: "short", timeStyle: "short", hour12: false };
      return this.movie.watchedAt ? new Date(this.movie.watchedAt).toLocaleString('en-US', options) : "---"
    },
    moviePath() {
      let levels =  this.movie.level1 
        + (this.movie.level2!=="-" ? "/" + this.movie.level2 : "")
      return levels
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
    updateMovie(movie,updateType) {
      this.$emit('update-movie', {movie,updateType})
    },
    onSetRating(i) {
      this.movie.rating = i
      this.updateMovie(this.movie, "rating")
    },
    onSetStartFlagTime(startFlagTime) {
      this.movie.sft = startFlagTime
      this.updateMovie(this.movie, "startflagtime")
    },
    onSetMarkers(markers) {
      this.movie.markers = markers
      this.updateMovie(this.movie, "markers")
    },
    onSetWatchedAt(watchedAt) {
      this.movie.watchedAt = watchedAt
      // also set a fresh random number
      this.movie.rnr = Math.round(Math.random()*1e9)
      this.updateMovie(this.movie, "watchedAt")
    },
    onSetResumeTime(resumeTime) {
      if (resumeTime === this.startFlagTimeDefault) {
        resumeTime = null
      }
      resumeTime = resumeTime ? (1*resumeTime).toFixed(2) : null
      this.movie.rt = resumeTime
      this.updateMovie(this.movie, "resume time")
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
    isActive(newVal,oldVal) {
      if(newVal || oldVal) {
        this.embedPlayer = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.movie-container {
  padding: 10px 5px 20px;
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
  margin: -7px;
  padding: 7px;
  .sub-container {
    flex-grow: 1;
    max-height: 100vh;
  }
  .rating,
  .info {
    display: none;
    height: 0;
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
.title {
  margin: 10px 0 10px 0;
}
.path {
  text-align: right;
}
.movie {
  width: 100%;
  max-height: 100vh;
  border: 1px solid rgb(108, 108, 108);
}
.meta.info {
  font-size: 80%;
  text-align: center;
  margin-top: 1em;
}
</style>