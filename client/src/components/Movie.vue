<template>
  <div class="movie-container">
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
export default {
  name:"Movie",
  props: ['movie'],
  components: {
  },
  data() {
    return {
    }
  },
  computed: {
    movieSrc() {
      return this.movie.src || this.movie.path
    },
    mimeType() {
      return this.movie.mime || "video/mp4"
    },
    movieTitle() {
      return this.movie.title || this.movie.basename.replace(".mp4","").replace(/[-_]/g, " ")
    },
    movieLevels() {
      let levels =  this.movie.level2 ? this.movie.level2 + "/" : ""
      levels = levels + this.movie.level1
      return levels
    }
  },
  methods: {
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