<template>
  <div>
    <h1>
      <font-awesome-icon icon="film"/>Movies
    </h1>

    <div class="controls pagination convert-to-block-on-small-device">

      <div>
        <span class="pagination-info">
          Page {{ pageNr }} of {{ nrOfPages }} <span class="info">({{ totalNrOfMovies }} movies)</span>
        </span>

        <button @click="showQueryControls = !showQueryControls" class="action button">
          {{ showQueryControls? 'hide' : 'show' }} query filters
          <font-awesome-icon icon="filter" class="flush-right"/>
        </button>

        <span class="info" v-if="!showQueryControls">
          &nbsp;⇝ {{ paginationState.rating }} &nbsp; {{ paginationState.level1 || 'all' }} / {{ paginationState.level2 || 'all' }}
        </span>
      </div>

      <div v-if="showQueryControls">
        <div class="filter-group">
          <span class="filter-type">Sort by:</span>
          <div class="filter-set">
            <div class="filter" v-for="type in sortTypes" :key="type">
              <input type="radio" :id="'type-' + type" :value="type" v-model="sortType" >
              <label :for="'type-' + type" class="action button">
                {{ type }}
              </label>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-type">Sort direction:</span>
          <div class="filter-set">
            <div class="filter" v-for="sortUp in [true,false]" :key="sortUp">
              <input type="radio" :id="'sortUp-' + sortUp" :value="sortUp" v-model="sortAsc" >
              <label :for="'sortUp-' + sortUp" class="action button">
                <font-awesome-icon :icon="sortUp? 'sort-amount-up' : 'sort-amount-down'" class="flush-right"/>
              </label>
            </div>
          </div>
          <span v-if="sortType==='random'" class="side-button">
            ⇝
            <button @click="shuffle" class="action button side-button">
              shuffle
              <font-awesome-icon icon="random" class="flush-right"/>
            </button>
          </span>
        </div>

        <div class="filter-group">
          <span class="filter-type">Items per page:</span>
          <div class="filter-set">
            <div class="filter" v-for="pageLimit in paginationOptions.pageLimits" :key="pageLimit">
              <input type="radio" :id="'pageLimit-' + pageLimit" :value="pageLimit" v-model="paginationState.limit" >
              <label :for="'pageLimit-' + pageLimit" class="action button">
                {{ pageLimit }}
              </label>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-type">Rating:</span>
          <div class="filter-set">
            <div class="filter" v-for="rating in paginationOptions.ratings" :key="'qr-'+rating">
              <input type="radio" :id="'qrating-' + rating" :value="rating" v-model="paginationState.rating" >
              <label :for="'qrating-' + rating" class="action button">
                {{ rating==="0+" ? "all" : rating==="0" ? "no" : rating }}
              </label>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-type">Level 1:</span>
          <span
            class="action button cntr clear"
            :class="{checked: !paginationState.level1}"
            @click="clearLevel1Query"
          >all</span>
          ➔
          <div class="filter-set">
            <div class="filter" v-for="level1 in paginationOptions.level1s" :key="'qr-'+level1">
              <input type="radio" :id="'qlevel1-' + level1" :value="level1" v-model="paginationState.level1" >
              <label :for="'qlevel1-' + level1" class="action button"
                :class="{
                  no_results_when_clicked: hasEmptySetWhenFiltered('level1', level1)
                  }"
              >
                {{ level1 }}
              </label>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-type">Level 2:</span>
          <span
            class="action button cntr clear"
            :class="{checked: !paginationState.level2}"
            @click="clearLevel2Query"
          >all</span>
          ➔
          <div class="filter-set">
            <div class="filter" v-for="level2 in paginationOptions.level2s" :key="'qr-'+level2">
              <input type="radio" :id="'qlevel2-' + level2" :value="level2" v-model="paginationState.level2" >
              <label :for="'qlevel2-' + level2" class="action button"
                :class="{
                  no_results_when_clicked: hasEmptySetWhenFiltered('level2', level2)
                  }"
              >
                {{ level2 }}
              </label>
            </div>
          </div>
        </div>


        <div class="filter-group">
          <span class="filter-type">View hidden items:</span>
          <div class="filter-set">
            <div class="filter" v-for="showHidden in [false,true]" :key="showHidden">
              <input type="radio" :id="'showHidden-' + showHidden" :value="showHidden" v-model="queryHidden" >
              <label :for="'showHidden-' + showHidden" class="action button">
                {{ showHidden? 'yes' : 'no' }}
                <font-awesome-icon :icon="showHidden? 'eye' : 'eye-slash'" class="flush-right"/>
              </label>
            </div>
          </div>

          <span class="side-button">
            ⇝
            <button @click="showDeleteButtons = !showDeleteButtons" class="action button side-button">
              {{ showDeleteButtons? 'disable' : 'enable' }} hide buttons
              <font-awesome-icon icon="eye-slash" class="flush-right"/>
            </button>
          </span>
        </div>


      </div>
    </div>

    <div v-if="loading" class="loading">loading...</div>
    <div v-if="!resultsFound" class="noresults">{{ noResultsText }}</div>
    <transition-group
      v-if="!loading && movies && movies[0]"
      tag="div"
      name="movies-list"
      class="grid"
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
          :isActive="intSecObsv.activeIDs.includes(movie._id)"
          :movie="movie"
          @edit-movie="editMovie"
          @toggle-fullwidth="onToggleFullWidth"
          @hide-movie="hideMovie"
          @unhide-movie="unhideMovie"
          @remove-movie="removeMovie"
          class="cell-content"
          :showDeleteButton="showDeleteButtons"
        />
      </div>
    </transition-group>

    
    <div class="controls pagination convert-to-block-on-small-device">
      <div class="filter-group">
        <span class="filter-type">Page Nr:</span>
        <div class="filter-set">
          <div class="filter">
            <input type="radio" :id="'prev'" :value="paginationState.nr > 1 ? paginationState.nr - 1 : 1" v-model="paginationState.nr" >
            <label :for="'prev'" class="action button nocheck" :class="paginationState.nr === 1 ? 'inactive' : ''">
              &lt; prev
            </label>
          </div>
          <div class="filter" v-for="(pageNr, index) in pageNrs" :key="index">
            <input v-if="pageNr!=='...'" type="radio" :id="'pageNr-' + pageNr" :value="pageNr" v-model="paginationState.nr" >
            <label v-if="pageNr!=='...'" :for="'pageNr-' + pageNr" class="action button">
              {{ pageNr }}
            </label>
            <span v-if="pageNr==='...'" class="spacer">...</span>
          </div>
          <div class="filter">
            <input type="radio" :id="'next'" :value="paginationState.nr < nrOfPages ? paginationState.nr + 1 : paginationState.nr" v-model="paginationState.nr" >
            <label :for="'next'" class="action button nocheck" :class="paginationState.nr === nrOfPages ? 'inactive' : ''">
              next &gt;
            </label>
          </div>
          <div class="filter" v-if="showPageNrInput">
            <input class="input-page-number" type="number"
              min="1"
              :max="nrOfPages"
              :step="Math.floor(nrOfPages / 10)"
              v-model="paginationState.nr"
              @change="ensurePaginationStateNrIsNumber"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="screen" v-if="hasFullWidthMovie">
    </div>
  </div>
</template>

<script>
import MovieContainer from "@/components/MovieContainer";

import activateOnIntersection from '@/mixins/activate-on-intersection.js';

import { mapState, mapGetters, mapActions } from "vuex";

import { logMessage } from '@/utils/logger.js'
import {
  persistPaginationState,
  retrievePaginationState
} from "@/utils/persistence.js"

export default {
  name: "Movies",
  mixins: [activateOnIntersection],
  components: {
    MovieContainer,
  },
  data() {
    return {
      sortTypes: ["random", "rating", "date created", "date updated", "name", "duration"],
      sortType: "random",
      sortDateDefault: "created",
      ratings: [],
      level1s: [],
      level2s: [],
      filter: { ratings: [], level1s: [], level2s: [] },
      showQueryControls: false,
      showDeleteButtons: false,
      sortAsc: true,
      hasFullWidthMovie: false,
      movieBasePath: "/media/movies/",
      isInit: true,
      paginationOptions: {
        pageLimits: [4,6,8,12,16,20,24,30,36,60,100],
        ratings: ["0+","0","1","1+","2","2+","3","3+","4","4+","5"],
        level1s: process.env.VUE_APP_LEVELS1.split(','),
        level2s: process.env.VUE_APP_LEVELS2.split(','),
      },
      paginationState: {
        limit: 9,
        skip: 0,
        nr: 1,
        rating: "0+",
        level1: "",
        level2: "",
      },
      queryHidden: false,
      filterQuery: {
        rating: {
          $gte: 0
        },
        level1: "",
        level2: "",
        hidden: {
          $ne: true
        },
      },
      intSecObsv: {
        activeIDs: [],
      },
      minMovieCellHeight: 300,
    };
  },
  created() {
    // Find all movies from server.
    this.findMovies({query: {}})
      .then(this.setFilterData)
      .catch(err => {
        this.handleError(err);
      });
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions("movies", { findMovies: "find" }),
    init() {
      let p = retrievePaginationState(this.paginationState)
      // backwards compatibility test:
      // ignore stored state if it contains a pageLimits property
      if (!p.pageLimits) {
        // new version - use
        this.paginationState = p
        logMessage("Using stored pagination state ", p);
      } else {
        // old version - replace
        p = this.paginationState
        persistPaginationState(p)
      }

      this.$nextTick(() => {
        this.isInit = false
      })
    },
    handleError(e) {
      console.error("Movies Error: ", e);
      if (e.name === "NotAuthenticated") {
        this.$router.push("/login");
      }
    },
    editMovie(props) {
      logMessage("Edit movie ", props);
      // save the modifictions
      props.movie.rating = props.mod.rating;
      props.movie.watchedAt = Date.now();
      // prevent ui-specific properties from cluttering the DB
      delete props.movie.ui
      props.movie
        .update()
        .then(movie => {
          logMessage("edit succesful", movie);
          this.setFilterData()
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    hideMovie(props) {
      logMessage("Hide movie ", props);
      // save the modifictions
      props.movie.hidden = true;
      // prevent ui-specific properties from cluttering the DB
      delete props.movie.ui
      props.movie
        .update()
        .then(movie => {
          logMessage("hide succesful", movie);
          this.setFilterData()
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    unhideMovie(props) {
      logMessage("Unhide movie ", props);
      // save the modifictions
      props.movie.hidden = false;
      // prevent ui-specific properties from cluttering the DB
      delete props.movie.ui
      props.movie
        .update()
        .then(movie => {
          logMessage("unhide succesful", movie);
          this.setFilterData()
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    removeMovie(props) {
      logMessage("remove movie ", props);
      props.movie
        .remove()
        .then(movie => {
          logMessage("remove succesful", movie);
          this.setFilterData()
        })
        .catch(err => {
          this.handleError(err);
        });
    },
    onToggleFullWidth() {
      this.hasFullWidthMovie = !this.hasFullWidthMovie
    },
    setFilterData() {
      // get list of user-defined ratings and levels, and remove duplicates
      const moviesAmended = this.moviesAmended
      this.ratings = moviesAmended
        .map(m => m.rating)
        .filter((c, i, s) => c!=="" && s.indexOf(c) === i)
        .sort()
      //logMessage("ratings:", this.ratings)

      this.level1s = moviesAmended
        .map(m => m.level1)
        .filter((c, i, s) => c && s.indexOf(c) === i)
        .sort()
      logMessage("level1s:", this.level1s)

      this.level2s = moviesAmended
        .map(m => m.level2)
        .filter((c, i, s) => c && s.indexOf(c) === i)
        .sort()
      logMessage("level2s:", this.level2s)
    },
    hasEmptySetWhenFiltered(filterType, filterValue) {
      const test = function(arr,val) {
        return !(arr.length > 0 
          && typeof arr.find(el => el === val) !== "undefined")
      }
      const expectEmptySet = test(this[filterType+"s"], filterValue)
      return expectEmptySet
    },
    clearLevel1Query() {
      this.paginationState.level1 = ""
    },
    clearLevel2Query() {
      this.paginationState.level2 = ""
    },
    resetPage() {
      this.paginationState.skip = 0
      this.paginationState.nr = 1
      this.setFilterData()
    },
    ensurePaginationStateNrIsNumber() {
      this.paginationState.nr = 1 * this.paginationState.nr
    },
    shuffle() {
      const allMovies = this.findMoviesInStore({
            query: {}
          }).data
      allMovies.forEach( movie => {
        movie.rnr = Math.round(Math.random()*1e9)
        movie.update()
      })
    },
    toggleSort() {
      this.sortAsc = !this.sortAsc
    },
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
    query() {
      // it is not necessary to define ownerId in the query:
      // The 'before' hooks in movies.hooks.js guarantee that only
      // the current user's movies are returned.
      // In combination with movies service clearAll on logout.
      //
      // We can use query to set pagination options
      // https://docs.feathersjs.com/api/databases/querying.html
      //
      let query = {}
      let sort = {}
      const sortInd = this.sortAsc ? 1 : -1
      switch (this.sortType) {
        case "random":
          sort.rnr = sortInd
          break;
        case "rating":
          sort.rating = sortInd
          break;
        case "date created":
          sort.createdAt = sortInd
          break;
        case "date updated":
          sort.updatedAt = sortInd
          break;
        case "name":
          sort.basename = sortInd
          break;
        case "duration":
          sort.metaDurationInSec = sortInd
          break;
      }
      query.$sort = sort
      query.$limit = this.paginationState.limit
      query.$skip = this.paginationState.skip

      query = {...this.purgedFilterQuery, ...query}
      logMessage("query: ", query)
      return query;
    },
    purgedFilterQuery() {
      let fq = {...this.filterQuery}
      if (fq.level1 === "") delete fq.level1
      if (fq.level2 === "") delete fq.level2
      if (fq.rating && fq.rating.$gte === 0) delete fq.rating
      return fq
    },
    movies() {
      return this.moviesAmended
    },
    moviesQueryResult() {
      return this.user
        ? this.findMoviesInStore({
            query: this.query
          })
        : {data:[],total:0}
    },
    totalNrOfMovies() {
      return this.moviesQueryResult.total
    },
    moviesAmended() {
      //logMessage("this.moviesQueryResult", this.moviesQueryResult)
      return this.moviesQueryResult.data
          .map(m => {
            m.ui = {
              src: this.movieBasePath + m.path
            }
            m.rating = m.rating ? 1*m.rating : 0
            m.level2 = m.level2 || "-"
            //logMessage({m})
            return m
          })
    },
    noResultsText() {
      return "No movies found..."
    },
    moviesFilterMeta() {
      return this.moviesAmended.map(movie => ({
        rating: movie.rating,
        level1: movie.level1,
        level2: movie.level2,
        path: movie.path
      }));
    },
    nrOfPages() {
      return Math.ceil(this.totalNrOfMovies / this.paginationState.limit)
    },
    showPageNrInput() {
      return this.nrOfPages > 10
    },
    pageNrs() {
      // create an array of numbers 1 to nrOfPages, centered around the current page
      const nrOfPages = this.nrOfPages
      const displayedPageRange = 2
      const currentPageNr = 1 * this.paginationState.nr
      let pagesArray = Array(nrOfPages).join().split(',').map((v,i) => i+1)
      pagesArray = pagesArray.filter(nr => {
        return nrOfPages <= 2 * displayedPageRange + 3 || nr === 1 || nr === nrOfPages || (nr >= currentPageNr - displayedPageRange && nr <= currentPageNr + displayedPageRange)
        })
      if (nrOfPages > 2 * displayedPageRange + 3) {
        const lim1 = 2 * displayedPageRange
        const lim2 = nrOfPages - 2 * displayedPageRange
        if (currentPageNr <= lim1) {
          pagesArray.splice(currentPageNr + displayedPageRange, 0, '...')
        }
        if (currentPageNr >= lim2) {
          pagesArray.splice(1, 0, '...')
        }
        if (currentPageNr > lim1 && currentPageNr < lim2) {
          pagesArray.splice(1, 0, '...')
          pagesArray.splice(displayedPageRange * 2 + 3, 0, '...')
        }
      }
      return pagesArray
    },
    pageNr() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.nr
    },
    pageLimit() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.limit
    },
    pageRating() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.rating
    },
    pageLevel1() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.level1
    },
    pageLevel2() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.level2
    }
  },
  watch: {
    pageNr(newVal, oldVal) {
      if (!this.isInit) {
        logMessage("page Nr changed from " + oldVal + " to " + newVal)
        // scroll to top
        window.scrollTo({top:400, left:0, behavior:'instant'})
        window.scrollTo({top:130, left:0, behavior:'smooth'})
        this.paginationState.skip = this.paginationState.limit * (1 * this.paginationState.nr - 1)
      }
    },
    pageLimit(newVal, oldVal) {
      if (!this.isInit) {
        logMessage("page Limit changed from " + oldVal + " to " + newVal)
        this.paginationState.nr = 1 + Math.floor((this.paginationState.nr - 1)*(oldVal/newVal))
        this.paginationState.skip = (this.paginationState.nr - 1) * newVal
      }
    },
    pageRating(newVal, oldVal) {
      logMessage("page Rating changed from " + oldVal + " to " + newVal)
      if (newVal.includes("+")) {
        this.filterQuery.rating = {
          $gte: 1 * newVal.replace("+","")
        }
      } else {
        this.filterQuery.rating = 1 * newVal
      }
      this.resetPage()
    },
    pageLevel1(newVal, oldVal) {
      logMessage("page Level1 changed from " + oldVal + " to " + newVal)
      if (newVal !== "") {
        this.filterQuery.level1 = newVal
      } else {
        this.filterQuery.level1 = ""
      }
      this.resetPage()
    },
    pageLevel2(newVal, oldVal) {
      logMessage("page Level2 changed from " + oldVal + " to " + newVal)
      if (newVal !== "") {
        this.filterQuery.level2 = newVal
      } else {
        this.filterQuery.level2 = ""
      }
      this.resetPage()
    },
    paginationState: {
      deep: true,
      handler: function(newVal) {
        logMessage("paginationState changed to ", newVal)
        persistPaginationState(newVal)
      }
    },
    queryHidden(newVal) {
      if (newVal === true) {
        this.filterQuery.hidden = true
      } else {
        this.filterQuery.hidden =  {
          $ne: true
        }
      }
      this.resetPage()
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
.pagination {
  margin: 4em 0;
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
span.side-button{
  margin-left:2em;
}
.action.button.side-button {
  margin-left:1em;
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
.spacer {
  display: inline-block;
  margin-left: .6em;
}
.pagination-info {
  margin-right: 1em;
}
input[type="number"].input-page-number {
  margin-left: 2em;
  width: 2.7em;
  padding: 5px
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
    width: 20%;
  }
}
@media all and (min-width: 2000px) {
  .grid .grid-cell {
    width: 16.666%;
  }
}

</style>
