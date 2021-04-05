<template>
  <div>
    <h1>
      <font-awesome-icon icon="video"/>Movies
    </h1>

    <div v-if="resultsFound" class="controls convert-to-block-on-small-device">
      <button @click="displayGrid=!displayGrid" class="action button">
        <font-awesome-icon :icon="displayGrid? 'align-justify' : 'th'" class="flush-right"/>
      </button>
      <button
        v-if="sortType==='color' || sortType==='category'"
        @click="sortAsc = !sortAsc"
        class="action button"
      >sort
        <font-awesome-icon
          :icon="sortAsc? 'sort-amount-down' : 'sort-amount-up'"
          class="flush-right"
        />
      </button>
      <button v-else @click="sortDateAsc = !sortDateAsc" class="action button">sort
        <font-awesome-icon
          :icon="sortDateAsc? 'sort-amount-down' : 'sort-amount-up'"
          class="flush-right"
        />
      </button>
      <button @click="cycleSortType" class="action button">
        ➔ by
        {{ sortType }}
        <font-awesome-icon icon="check" class="flush-right"/>
      </button>
      <button @click="toggleFilters" class="action button">
        {{ showFilters? 'hide' : 'show' }} filters
        <font-awesome-icon icon="filter" class="flush-right"/>
        <span class="filter-cntr">({{ nrFiltersApplied }} applied)</span>
      </button>
    </div>
    <!--
    <pa-filter-control
      v-show="showFilters"
      :colors="colors"
      :ratings="ratings"
      :pins="pins"
      :filter="filter"
      :filterMeta="moviesFilterMeta"
    />
    -->
    <div v-if="loading" class="loading">loading...</div>
    <div v-if="!resultsFound" class="noresults">{{ noResultsText }}</div>
    <transition-group
      v-if="!loading && movies && movies[0]"
      tag="div"
      name="movies-list"
      :class="{'grid' : displayGrid, 'grid-list' : !displayGrid}"
    >
      <div
        v-for="movie in movies"
        :key="movie._id"
        class="grid-cell movies-list-cell"
      >
        <Movie
          :movie="movie"
          @edit-movie="editMovie"
          class="cell-content"
        />
      </div>
    </transition-group>

  </div>
</template>

<script>
import Movie from "@/components/Movie";

import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Movies",
  components: {
    Movie,
  },
  data() {
    return {
      types: ["rating", "date created", "date modified"],
      sortType: "date modified",
      filter: { ratings: [], level1: [], level2: [] },
      showFilters: false,
      sortAsc: true,
      sortDateAsc: false,
      displayGrid: true,
      movieBasePath: "/media/movies/"
    };
  },
  created() {
    // Find all movies from server. We'll filter/sort on the client.
    this.findMovies({ query: {} })
      .then(this.setRatings)
      .catch(err => {
        this.handleError(err);
      });
  },
  methods: {
    ...mapActions("movies", { findMovies: "find" }),
    handleError(e) {
      console.error("Movies Error: ", e);
      if (e.name === "NotAuthenticated") {
        this.$router.push("/login");
      }
    },
    editMovie(props) {
      console.log("Edit movie ", props);
      // save the modifictions
      props.movie.rating = props.mod.rating;
      props.movie.watchedAt = Date.now();
      props.movie
        .update()
        .then(movie => {
          console.log("edit succesful", movie);
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    cycleSortType() {
      let typeIndex = this.types.findIndex(t => t === this.sortType) + 1;
      if (typeIndex >= this.types.length) {
        typeIndex = 0;
      }
      this.sortType = this.types[typeIndex];
      //console.log(this.sortType + " " + typeIndex);
    },
    sortByDate(a, b, type) {
      type = type || "updated";
      let dateDiff;
      dateDiff =
        type === "updated"
          ? new Date(b.updatedAt) - new Date(a.updatedAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      return this.sortDateAsc ? -dateDiff : dateDiff;
    },
    uiSort(a, b) {
      // TODO: implement sort selector
      let dir = this.sortAsc ? 1 : -1;
      let result;
      switch (this.sortType) {
        case "rating":
          result =
            b.rating < a.rating
              ? 1 * dir
              : b.rating > a.rating
              ? -1 * dir
              : 0;
          break;
        case "date created":
          result = this.sortByDate(a, b, "created");
          break;
        case "date modified":
          result = this.sortByDate(a, b);
          break;
      }
      return result;
    },
    toggleFilters(evt) {
      evt.target.blur();
      this.showFilters = !this.showFilters;
    },
    uiFilter(movie) {
      // Filter by selected ratings, level1 and level2.
      // Multiple ratings are `or`-ed. Multiple levels are `or`-ed.
      // Example:
      // (movie.rating === 5 || movie.rating === 4) && (movie.level1 === 'g')
      const level1 = movie.splitPath[1]
      const level2 = movie.splitPath[2]
      const clrReducer = (acc, cur) => acc || movie.rating === cur;
      const catReducer = (acc, cur) => acc || level1 === cur;
      const pinReducer = (acc, cur) => acc || level2 === cur;
      const hasRating = this.filter.ratings.length > 0;
      const hasLevel1 = this.filter.level1.length > 0;
      const hasLevel2 = this.filter.level2.length > 0;
      return (
        this.filter.ratings.reduce(clrReducer, !hasRating) &&
        this.filter.level1.reduce(catReducer, !hasLevel1) &&
        this.filter.level2.reduce(pinReducer, !hasLevel2)
      );
    },
    setRatings() {
      // get list of user-defined ratings and remove duplicates
      this.ratings = this.moviesUnfiltered
        .map(n => n.rating)
        .filter((c, i, s) => s.indexOf(c) === i)
        .sort();
      //console.log({ ratings: this.ratings });
    }
  },
  computed: {
    ...mapState("auth", { user: "payload" }),
    ...mapState("movies", {
      loading: "isFindPending",
      creating: "isCreatePending"
    }),
    ...mapGetters("movies", { findMoviesInStore: "find" }),
    resultsFound() {
      return !this.loading && this.movies && this.movies[0];
    },
    rating() {
      // For large datasets, an option is to implement a query-selector.
      // But for the Movies service, we can just filter on the client.
      return null;
    },
    query() {
      // it is not necessary to define ownerId in the query:
      // The 'before' hooks in movies.hooks.js guarantee that only
      // the current user's movies are returned.
      // In combination with movies service clearAll on logout
      let query = {};
      if (this.rating) {
        query.rating = this.rating;
      }
      return query;
    },
    movies() {
      return this.moviesUnfiltered
        .filter(this.uiFilter)
        .sort(this.sortByDate)
        .sort(this.uiSort);
    },
    moviesUnfiltered() {
      return this.user
        ? this.findMoviesInStore({
            query: this.query
          }).data
          .map(m => {
            m.src = this.movieBasePath + m.path
            return m
          })
        : [];
    },
    nrFiltersApplied() {
      return (
        this.filter.ratings.length +
        this.filter.level1.length +
        this.filter.level2.length
      );
    },
    noResultsText() {
      if (this.nrFiltersApplied === 0) {
        return "No movies found..."
      } else {
        return "No movies match the filter settings..."
      }
    },
    moviesFilterMeta() {
      return this.moviesUnfiltered.map(n => ({
        rating: n.rating,
        level1: n.level1,
        level2: n.level2
      }));
    }

  }
};
</script>

<style>
h2.movies {
  display: inline-block;
  margin-right: 1em;
  vertical-align: top;
}
#movies .controls {
  cursor: pointer;
  display: inline-block;
  position: relative;
  top: -5px;
}
.filter-cntr {
  font-weight: 400;
  color: #948972;
  margin-left: 0.2em;
}
.grid {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
  margin: 0 -0.2rem;
}
.grid .cell-content {
  margin: 5px;
}
.grid-list .grid-cell {
  width: 100%;
}
.grid .grid-cell {
  width: 33.333%;
  display: inline-block;
}
.grid .grid-cell.expanded {
  width: 100%;
  border: 1px dashed #454545;
}
.grid .collapsed {
  overflow-y: auto;
  max-height: 15rem !important;
}
.grid pre {
  white-space: pre-wrap;
}
.movies-list-cell {
  transition: all 1s;
}
.movies-list-enter,
.movies-list-leave-to {
  opacity: 0;
  transform: translate(0, -100px);
}
.movies-list-leave-active {
  position: absolute;
}
.grid-list .movies-list-cell + .movies-list-cell {
  border-top: 1px dashed #454545;
}
.grid .movies-list-cell {
  border: 1px dashed #454545;
  margin: -1px;
}
@media all and (max-width: 400px) {
  .grid .grid-cell {
    width: 100%;
  }
}
@media all and (min-width: 400px) {
  .grid .grid-cell {
    width: 50%;
  }
}
@media all and (min-width: 800px) {
  .grid .grid-cell {
    width: 33.333%;
  }
}
@media all and (min-width: 1200px) {
  .grid .grid-cell {
    width: 25%;
  }
}
@media all and (min-width: 1600px) {
  .grid .grid-cell {
    width: 16.666%;
  }
}

</style>
