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
          <label :for="'rating-' + rating" class="action button"
            :class="{
              no_results_when_clicked: hasEmptySetWhenFiltered('rating', rating),
              no_change_when_clicked: noChangeInSetWhenFiltered('rating', rating)
              }"
          >
            {{ rating }}
            <span class="clr cntr" :class="'rating-' + rating">({{ ratingsCount[rating] }})</span>
          </label>
        </div>
      </div>

      <div v-if="hasLevel1s" class="filter-group">
        <span class="filter-type">Level 1:</span>
        <span
          class="action button cntr clear cat-none"
          :class="{checked: noLevel1sFiltered}"
          @click="clearLevel1Filter"
        >clear</span>
        ➔
        <div class="filter" v-for="level1 in level1s" :key="level1">
          <div v-if="level1.length>0">
            <input type="checkbox" :id="level1" :value="level1" v-model="filter.level1s">
            <label :for="level1" class="action button"
              :class="{
                no_results_when_clicked: hasEmptySetWhenFiltered('level1', level1),
                no_change_when_clicked: noChangeInSetWhenFiltered('level1', level1)
                }"
            >
              {{ level1 }}
              <span class="cntr">({{ level1sCount[level1] }})</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="hasLevel2s" class="filter-group">
        <span class="filter-type">Level 2:</span>
        <span
          class="action button cntr clear cat-none"
          :class="{checked: noLevel2sFiltered}"
          @click="clearLevel2Filter"
        >clear</span>
        ➔
        <div class="filter" v-for="level2 in level2s" :key="level2">
          <div v-if="level2.length>0">
            <input type="checkbox" :id="level2" :value="level2" v-model="filter.level2s">
            <label :for="level2" class="action button"
              :class="{
                no_results_when_clicked: hasEmptySetWhenFiltered('level2', level2),
                no_change_when_clicked: noChangeInSetWhenFiltered('level2', level2)
                }"
            >
              {{ level2 }}
              <span class="cntr">({{ level2sCount[level2] }})</span>
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
  props: ["filter", "ratings", "level1s", "level2s", "filterMeta"],
  mounted() {
  },
  methods: {
    metaCounter(type, attr, pre) {
      let metas = {}
      pre = pre || ""
      let metasItr = type
        .map(c => {
          const reducer = (acc, cur) => (cur[attr] === c ? acc + 1 : acc);
          let nr = this.filteredFilterMeta.reduce(reducer, 0);
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
      // clear the level1s filter array by removing all elements
      this.filter.level1s.splice(0);
    },
    clearLevel2Filter() {
      // clear the level2s filter array by removing all elements
      this.filter.level2s.splice(0);
    },
    capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    noTypesFilteredName(filterType) {
      return 'no' + this.capitalizeFirstLetter(filterType) + 'sFiltered'
    },
    filterValueCount(filterType, filterValue) {
      return this[filterType+'sCount'][filterValue]
    },
    hasEmptySetWhenFiltered(filterType, filterValue) {
      // If *no* filter has been applied for a given filterType and the count
      // for a given filter equals 0, then activating that filter will result
      // in an empty result set.
      const expectEmptySet = this[this.noTypesFilteredName(filterType)] 
        && this.filterValueCount(filterType, filterValue)===0
      return expectEmptySet
    },
    noChangeInSetWhenFiltered(filterType, filterValue) {
      // If a filter *has* been applied for a given filterType and the count
      // for a given filter equals 0, then activating that filter may or may
      // not result in a change in the result set.
      const mayCauseChange = !this[this.noTypesFilteredName(filterType)] 
        && this.filterValueCount(filterType, filterValue)===0
      let expectNoChange = true

      if (mayCauseChange) {
        // Additional check that there is no other matching filterMeta entry
        // determines whether there truly is no change.

        // `this.filter` contains three arrays with all selected filters (some may not contribute to result yet) -> `this.filter.level1s` array etc
        // `this.filterMeta` contains am array of all movies with metadata that can be filtered on.
        // `this.filteredFilterMeta` contains an array of filterMeta that contribute to the filtered result set

        // define a new temporary filter object with the addition of the
        // `filterValue` and check if that would return more results than
        // the current result set
        let filter = {
          ratings: [...this.filter.ratings],
          level1s: [...this.filter.level1s],
          level2s: [...this.filter.level2s]
        }
        filter[filterType+'s'] = [...filter[filterType+'s'], filterValue]

        const possibleResults = this.checkFilteredFilterMeta(filter)

        //console.log({filterValue: filterValue, filter: filter, possibleResults: possibleResults})

        expectNoChange = 
          possibleResults.length === this.filteredFilterMeta.length

      }
      return mayCauseChange && expectNoChange
    },
    checkFilteredFilterMeta(filter) {
      const test = function(arr,val) {
        return !(arr.length > 0 
          && typeof arr.find(el => el === val) === "undefined")
      }
      return this.filterMeta.filter(m => {
        return test(filter.level1s, m.level1) 
           && test(filter.level2s, m.level2) 
           && test(filter.ratings, m.rating) 
      })
    },
  },
  computed: {
    filteredFilterMeta() {
      //console.log({filter:this.filter, filterMeta:this.filterMeta, ratings:this.ratings, level1s:this.level1s, level2s:this.level2s})
      const filter=this.filter
      return this.checkFilteredFilterMeta(filter)
    },
    hasRatings() {
      return this.ratings.length > 0
    },
    hasLevel1s() {
      return this.level1s.length > 0
    },
    hasLevel2s() {
      return this.level2s.length > 0
    },
    ratingsCount() {
      return this.metaCounter(this.ratings, "rating");
    },
    level1sCount() {
      return this.metaCounter(this.level1s, "level1");
    },
    level2sCount() {
      return this.metaCounter(this.level2s, "level2");
    },
    noRatingsFiltered() {
      return this.filter.ratings.length === 0;
    },
    noLevel1sFiltered() {
      return this.filter.level1s.length === 0;
    },
    noLevel2sFiltered() {
      return this.filter.level2s.length === 0;
    },
  }
};
</script>

<style lang="less" scoped>
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
label.no_change_when_clicked {
  opacity: .45;
  cursor: inherit;
}
label.no_results_when_clicked {
  opacity: .45;
  cursor: inherit;
  border-color: #dd0000;
  .cntr {
    color: #dd0000;
  }
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