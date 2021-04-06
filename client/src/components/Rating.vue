<template>
  <div class="rating">
    <span v-for="i in maxRating" :key="i">
      <font-awesome-icon 
        :icon="[i > displayRating ? 'far': 'fas', 'star']"
        @click="setRating(i)"
        @mouseover="showRating(i)"
        @mouseout="resetRating()"
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
    resetRating(i) {
      this.displayRating = this.rating
    },
  }
}
</script>