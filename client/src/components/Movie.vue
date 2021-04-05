<template>
  <div class="movie-container">
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
    }
  },
  methods: {
  },

}
</script>

<style lang="less" scoped>
.title {
  margin: 20px 0 10px 0;
}
.movie {
  width: 100%;
}
</style>