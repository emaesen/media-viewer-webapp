<template>
  <div>
    <h1>
      <font-awesome-icon icon="film"/>Movies <span class="info">({{ totalNrOfMovies }})</span>
    </h1>

    <div v-if="resultsFound" class="controls convert-to-block-on-small-device">
      <button @click="displayGrid=!displayGrid" class="action button">
        <font-awesome-icon :icon="displayGrid? 'align-justify' : 'th'" class="flush-right"/>
      </button>
      <button
        v-if="sortType==='rating'"
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
    <MovieFilter
      v-show="showFilters"
      :ratings="ratings"
      :level1s="level1s"
      :level2s="level2s"
      :filter="filter"
      :filterMeta="moviesFilterMeta"
    />
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
        :id="movie._id"
        class="grid-cell movies-list-cell"
        :style="'min-height:' + minMovieCellHeight + 'px;'"
        v-activate-on-intersection
      >
        <MovieContainer
          v-if="intSecObsv.activeIDs.includes(movie._id)"
          :movie="movie"
          @edit-movie="editMovie"
          @toggle-fullwidth="onToggleFullWidth"
          class="cell-content"
        />
      </div>
    </transition-group>
    <div class="screen" v-if="hasFullWidthMovie">
    </div>
  </div>
</template>

<script>
import MovieContainer from "@/components/MovieContainer";
import MovieFilter from "@/components/MovieFilter";

import activateOnIntersection from '@/mixins/activate-on-intersection.js';

import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Movies",
  mixins: [activateOnIntersection],
  components: {
    MovieContainer,
    MovieFilter,
  },
  data() {
    return {
      types: ["rating", "date created", "date updated"],
      sortType: "date created",
      sortDateDefault: "created",
      ratings: [],
      level1s: [],
      level2s: [],
      filter: { ratings: [], level1s: [], level2s: [] },
      showFilters: false,
      sortAsc: true,
      sortDateAsc: true,
      displayGrid: true,
      hasFullWidthMovie: false,
      movieBasePath: "/media/movies/",
      pagination: {
        limit: 30,
        skip: 0
      },
      intSecObsv: {
        activeIDs: [],
      },
      minMovieCellHeight: 300,
    };
  },
  created() {
    // Find all movies from server. We'll filter/sort on the client.
    this.findMovies({ query: {} })
      .then(this.setFilterData)
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
      // prevent ui-specific properties from cluttering the DB
      delete props.movie.ui
      props.movie
        .update()
        .then(movie => {
          console.log("edit succesful", movie);
          this.setFilterData()
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    onToggleFullWidth() {
      this.hasFullWidthMovie = !this.hasFullWidthMovie
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
      type = type || this.sortDateDefault;
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
        case "date updated":
          result = this.sortByDate(a, b, "updated");
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
      const clrReducer = (acc, cur) => acc || movie.rating === cur;
      const catReducer = (acc, cur) => acc || movie.ui.level1 === cur;
      const pinReducer = (acc, cur) => acc || movie.ui.level2 === cur;
      const hasRating = this.filter.ratings.length > 0;
      const hasLevel1 = this.filter.level1s.length > 0;
      const hasLevel2 = this.filter.level2s.length > 0;
      return (
        this.filter.ratings.reduce(clrReducer, !hasRating) &&
        this.filter.level1s.reduce(catReducer, !hasLevel1) &&
        this.filter.level2s.reduce(pinReducer, !hasLevel2)
      );
    },
    setFilterData() {
      // get list of user-defined ratings and levels, and remove duplicates
      this.ratings = this.moviesUnfiltered
        .map(m => m.rating)
        .filter((c, i, s) => c!=="" && s.indexOf(c) === i)
        .sort()
      console.log({ ratings: this.ratings })

      this.level1s = this.moviesUnfiltered
        .map(m => m.ui.level1)
        .filter((c, i, s) => c && s.indexOf(c) === i)
        .sort()
      console.log({ level1s: this.level1s })

      this.level2s = this.moviesUnfiltered
        .map(m => m.ui.level2)
        .filter((c, i, s) => c && s.indexOf(c) === i)
        .sort()
      console.log({ level2s: this.level2s })
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
    page() {
      // TODO: placeholder for pagination
      return null;
    },
    query() {
      // it is not necessary to define ownerId in the query:
      // The 'before' hooks in movies.hooks.js guarantee that only
      // the current user's movies are returned.
      // In combination with movies service clearAll on logout.
      //
      // We can use query to set pagination options
      // https://docs.feathersjs.com/api/databases/querying.html
      //
      // However, the UI filtering currently only acts on the queried dataset;
      // client-side filter options do not carry through to the DB query.
      let query = {};
      let sort = {}
      switch (this.sortType) {
        case "rating":
          sort.rating = this.sortAsc ? 1 : -1
          break;
        case "date created":
          sort.createdAt = this.sortDateAsc ? 1 : -1
          break;
        case "date updated":
          sort.updatedAt = this.sortDateAsc ? 1 : -1
          break;
      }
      query.$sort = sort

      if (this.pagination && this.pagination.limit) {
        query.$limit = this.pagination.limit
      }

      if (this.pagination && this.pagination.skip) {
        query.$skip = this.pagination.skip
      }
      console.log({query})
      return query;
    },
    movies() {
      return this.moviesUnfiltered
        .filter(this.uiFilter)
        .sort(this.sortByDate)
        .sort(this.uiSort);
    },
    moviesQueryResult() {
      return this.user
        ? this.findMoviesInStore({
            query: this.query
          })
        : {}
    },
    totalNrOfMovies() {
      return this.moviesQueryResult.total
    },
    maxNrOfMoviesPerPage() {
      return this.moviesQueryResult.limit || "unlimited"
    },
    nrOfMoviesSkipped() {
      return this.moviesQueryResult.skip
    },
    moviesUnfiltered() {
      //console.log("this.moviesQueryResult", this.moviesQueryResult)
      return this.moviesQueryResult.data
          .map(m => {
            m.ui = {
              level1: m.splitPath[0] || "-",
              level2: m.splitPath[1] || "-",
              src: this.movieBasePath + m.path
            }
            m.rating = m.rating ? 1*m.rating : 0
            console.log({m})
            return m
          })
    },
    nrFiltersApplied() {
      return (
        this.filter.ratings.length +
        this.filter.level1s.length +
        this.filter.level2s.length
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
      return this.moviesUnfiltered.map(movie => ({
        rating: movie.rating,
        level1: movie.ui.level1,
        level2: movie.ui.level2
      }));
    }

  }
};
</script>

<style>
h1 .info {
  font-weight: 400;
  font-size: 70%;
  letter-spacing: normal;
}
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
.screen {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: #000;
  opacity:.9;
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
