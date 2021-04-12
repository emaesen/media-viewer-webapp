<template>
  <div :class="['movie-container', {'full-width': isFullWidth}]">
    <div class="sub-container">
      <div class="rating">
        <Rating
          :rating="movieRating"
          @set-rating="setRating"
        />
      </div>
      <div class="levels info">
        {{ movieLevels }}
      </div>
      <div class="title info">
        {{ movieTitle }}
      </div>
      <MoviePlayer 
        class="movie" 
        :source="{src:movieSrc, type:mimeType, id:movie._id}"
        :options="{autoplay:false, volume:0.1}"
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
  props: ['movie'],
  components: {
    Rating,
    MoviePlayer
  },
  data() {
    return {
      isFullWidth: false
    }
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
    movieLevels() {
      let levels =  this.movie.ui.level1 
        + (this.movie.ui.level2 ? "/" + this.movie.ui.level2 : "")
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
.levels,
.title {
  margin: 10px 0 10px 0;
}
.levels {
  text-align: right;
}
.movie {
  width: 100%;
  max-height: 100vh;
}
</style>