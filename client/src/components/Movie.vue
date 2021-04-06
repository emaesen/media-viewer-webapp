<template>
  <div class="movie-container">
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
    <video 
      class="movie" 
      controls playsinline
      preload="metadata"
    >
      <source :src="movieSrc" :type="mimeType">
    </video>
  </div>
</template>

<script>
import Rating from "@/components/Rating";

export default {
  name:"Movie",
  props: ['movie'],
  components: {
    Rating
  },
  data() {
    return {
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
      let levels =  this.movie.ui.level2 ? this.movie.ui.level2 + "/" : ""
      levels = levels + this.movie.ui.level1
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
    }
  },

}
</script>

<style lang="less" scoped>
.movie-container {
  padding: 10px 5px 20px;
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
}
</style>