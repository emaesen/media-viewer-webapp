<template>
  <div class="rating-bar">
    <span v-for="i in maxRating" :key="i">
      <font-awesome-icon 
        :icon="[i > displayRating ? 'far': 'fas', 'star']"
        @click="setRating(i)"
        @mouseover="showRating(i)"
        @mouseout="resetRating()"
        class="rating-star"
        :class="[i > rating ? 'open': 'closed']"
      />
    </span>
  </div>
</template>

<script>
export default {
  name: "Rating",
  props: {
    rating: {
      type: Number,
      default: 0
    },
  },
  components: {
  },
  data() {
    return {
      maxRating: 5,
      displayRating: this.rating,
    }
  },
  computed: {
  },
  methods: {
    setRating(i) {
      this.displayRating = i
      console.log('set rating to ' + i)
      this.$emit('set-rating', i)
    },
    showRating(i) {
      this.displayRating = i
    },
    resetRating() {
      this.displayRating = this.rating
    },
  }
}
</script>

<style scoped>
.rating-bar {
  display: inline-block;
}
.rating-star {
  cursor: pointer;
}
.rating-star.closed {
  color: rgb(178, 157, 228);
}
.rating-star.open {
  opacity: .4;
}
.rating-bar:hover .rating-star.open {
  opacity: .8;
  color: rgb(157, 228, 184);
}
</style>