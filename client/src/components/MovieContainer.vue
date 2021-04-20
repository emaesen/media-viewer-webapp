<template>
  <div :class="['movie-container', {'full-width': isFullWidth}]">

    <div class="sub-container">
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
    </div>
  </div>
</template>

<script>
import Rating from "@/components/Rating";
import MoviePlayer from "@/components/MoviePlayer";

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
        volume:0,
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
}
</style>