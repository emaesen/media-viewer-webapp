<template>
  <div class="rating-bar">
    <span v-for="i in maxRating" :key="i">
      <font-awesome-icon 
        :icon="[i > displayRating ? 'far': 'fas', i===6 ? 'heart' :'star']"
        @click="onRatingClick(i)"
        @mouseover="showRating(i)"
        @mouseout="resetRating()"
        class="rating-star"
        :class="[i > (changedRating || rating) ? 'open': 'closed']"
      />
    </span>
    {{ changedRating }}
  </div>
</template>

<script>
import { logMessage } from '@/utils/logger.js'
import {
  debounce
} from "@/utils/helper.js"

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
      maxRating: 6,
      displayRating: this.rating,
      changedRating: null
    }
  },
  computed: {
    debounceRating() {
      return debounce((i)=>this.setRating(i), 2000)
    },
  },
  methods: {
    onRatingClick(i) {
      this.changedRating = i
      this.debounceRating(i)
    },
    setRating(i) {
      this.displayRating = i
      logMessage('received request to set rating to ' + i)
      this.$emit('set-rating', i)
      this.changedRating = null
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