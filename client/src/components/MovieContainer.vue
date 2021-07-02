<template>
  <div :class="['movie-container', {'full-width': isFullWidth}]">

    <div class="sub-container">
      <div class="hide">
        <font-awesome-icon icon="eye-slash" @click="onClickHideMovie"/>
      </div>
      <div class="rating">
        <Rating
          :rating="movieRating"
          @set-rating="setRating"
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
        :source="{src:movieSrc, type:mimeType, id:movie._id}"
        :options="options"
        @toggle-fullwidth="onToggleFullWidth"
      />
      <div v-if="!embedPlayer">
        <button class="action button"
          @click.stop="embedPlayer = true"
        >
          embed player
        </button>
      </div>
      <div class="meta info">
        {{ movieSize }} &nbsp; &nbsp; {{ movieDimensions }} &nbsp; &nbsp; {{ movieDuration }}
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
  props: ['movie', 'isActive'],
  components: {
    Rating,
    MoviePlayer
  },
  data() {
    return {
      isFullWidth: false,
      embedPlayer: false,
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
    moviePath() {
      let levels =  this.movie.level1 
        + (this.movie.level2!=="-" ? "/" + this.movie.level2 : "")
      return levels
    },
    movieRating() {
      return this.movie.rating
    },
  },
  methods: {
    setRating(i) {
      this.$emit('edit-movie', {
        movie: this.movie,
        mod: {
          rating: i
        }
      })
    },
    onToggleFullWidth() {
      this.$emit('toggle-fullwidth')
      this.isFullWidth = !this.isFullWidth
      if (this.isFullWidth) {
        this.$el.scrollIntoView({behavior: "smooth"})
      }
    },
    onClickHideMovie() {
      this.$emit('hide-movie', {movie:this.movie})
    }
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
  z-index: 999;
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
.hide {
  float: right;
  cursor: pointer;
  svg {
    color: rgba(151, 23, 0, 0.699);
  }
  svg:hover {
    color: rgb(253, 38, 0);
  }
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