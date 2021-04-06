<template>
  <transition name="slidefade">
    <div class="filters">

      <div v-if="hasRatings" class="filter-group">
        <span class="filter-type">Rating:</span>
        <span
          class="action button cntr clear rating-none"
          :class="{checked: noRatingsFiltered}"
          @click="clearRatingsFilter"
        >clear</span>
        ➔
        <div class="filter" v-for="rating in ratings" :key="rating">
          <input type="checkbox" :id="'rating-' + rating" :value="rating" v-model="filter.ratings">
          <label :for="'rating-' + rating" class="action button">
            {{ rating }}
            <span class="clr cntr" :class="'rating-' + rating">({{ ratingsCount[rating] }})</span>
          </label>
        </div>
      </div>

      <div v-if="hasLevels1" class="filter-group">
        <span class="filter-type">Level 1:</span>
        <span
          class="action button cntr clear cat-none"
          :class="{checked: noLevels1Filtered}"
          @click="clearLevel1Filter"
        >clear</span>
        ➔
        <div class="filter" v-for="level1 in levels1" :key="level1">
          <div v-if="level1.length>0">
            <input type="checkbox" :id="level1" :value="level1" v-model="filter.levels1">
            <label :for="level1" class="action button">
              {{ level1 }}
              <span class="cntr">({{ levels1Count[level1] }})</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="hasLevels2" class="filter-group">
        <span class="filter-type">Level 2:</span>
        <span
          class="action button cntr clear cat-none"
          :class="{checked: noLevels2Filtered}"
          @click="clearLevel2Filter"
        >clear</span>
        ➔
        <div class="filter" v-for="level2 in levels2" :key="level2">
          <div v-if="level2.length>0">
            <input type="checkbox" :id="level2" :value="level2" v-model="filter.levels2">
            <label :for="level2" class="action button">
              {{ level2 }}
              <span class="cntr">({{ levels2Count[level2] }})</span>
            </label>
          </div>
        </div>
      </div>

    </div>
  </transition>
</template>

<script>
export default {
  name: "MovieFilter",
  props: ["filter", "ratings", "levels1", "levels2", "filterMeta"],
  mounted() {
  },
  methods: {
    metaCounter(type, attr, pre) {
      let metas = {}
      pre = pre || ""
      let metasItr = type
        .map(c => {
          const reducer = (acc, cur) => (cur[attr] === c ? acc + 1 : acc);
          let nr = this.filterMeta.reduce(reducer, 0);
          let key = pre + c;
          return { [key]: nr };
        })
        .values();
      for (const meta of metasItr) {
        metas = { ...metas, ...meta };
      }
      return metas;
    },
    clearRatingsFilter() {
      // clear the ratings filter array by removing all elements
      this.filter.ratings.splice(0);
    },
    clearLevel1Filter() {
      // clear the levels1 filter array by removing all elements
      this.filter.levels1.splice(0);
    },
    clearLevel2Filter() {
      // clear the levels2 filter array by removing all elements
      this.filter.levels2.splice(0);
    }
  },
  computed: {
    hasRatings() {
      return this.ratings.length > 0
    },
    hasLevels1() {
      return this.levels1.length > 0
    },
    hasLevels2() {
      return this.levels2.length > 0
    },
    ratingsCount() {
      return this.metaCounter(this.ratings, "rating");
    },
    levels1Count() {
      return this.metaCounter(this.levels1, "level1");
    },
    levels2Count() {
      return this.metaCounter(this.levels2, "level2");
    },
    noRatingsFiltered() {
      return this.filter.ratings.length === 0;
    },
    noLevels1Filtered() {
      return this.filter.levels1.length === 0;
    },
    noLevels2Filtered() {
      return this.filter.levels2.length === 0;
    }
  }
};
</script>

<style scoped>
input,
label {
  display: inline-block;
}
input[type="checkbox"] {
  visibility: hidden;
  width: 1em;
}
span.clear.checked::before,
input[type="checkbox"]:checked + label::before {
  content: "✓ ";
  margin-left: -1.2em;
  color: #29dc58;
}
.clear {
  margin-left: 0.9em;
}
label.action.button {
  vertical-align: initial;
  margin-left: -0.5em;
  margin-right: 0.3em;
}
label {
  margin-left: -0.2em;
  margin-right: 0.3em;
}
.filters {
  padding: 5px;
}
.filter {
  display: inline-block;
}
.none {
  color: #948972;
}
.filter-type {
  display: inline-block;
  min-width: 4.5rem;
}
.clr {
  margin: 0;
}
.cntr {
  text-align: center;
  font-style: normal;
  font-weight: 400;
  color: #948972;
  line-height: 22px;
  font-size: 14px;
}
.slidefade-enter-active,
.slidefade-leave-active {
  transition: opacity 0.5s, transform 0.5s, max-height 0.6s;
  transform: scaleY(1);
  max-height: 75px;
}
.slidefade-enter,
.slidefade-leave-to {
  opacity: 0;
  transform: scaleY(0);
  max-height: 0;
}
</style>