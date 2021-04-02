<template>
  <div class="video-container">
    <video 
        class="video" 
        controls playsinline
        preload="metadata"
      >
        <!--source src="xxx.webm" type="video/webm;codecs=vp9" -->
        <source :src="videoSrc" :type="mimeType">

      </video>
  </div>
</template>

<script>
export default {
  name:"Video",
  props: ['video'],
  components: {
  },
  data() {
    return {
      videoTitle: "",
    }
  },
  computed: {
    videoSrc() {
      return this.video.src
    },
    mimeType() {
      return this.video.mime || "video/mp4"
    },
  },
  methods: {
  },

}
</script>

<style lang="less" scoped>
.video {
  width: 100%;
}
</style>