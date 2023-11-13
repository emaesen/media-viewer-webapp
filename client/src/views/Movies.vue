<template>
  <div>
    <h1>
      <font-awesome-icon icon="film"/>Movies
    </h1>

    <MoviePlayerMap/>
    
    <div class="controls filters convert-to-block-on-small-device">

      <div>
        <span class="pagination-info">
          Page {{ pageNr }} of {{ nrOfPages }} <span class="info">({{ totalNrOfMovies }} movies - {{ totalSizeOfMovies }})</span>
        </span>

        <button @click="paginationState.showQueryControls = !paginationState.showQueryControls" class="action button">
          <span class="action-text">
            {{ paginationState.showQueryControls? 'hide' : 'show' }}
          </span> query filters
          <font-awesome-icon icon="filter" class="flush-right"/>
        </button>

        <span class="info" v-if="!paginationState.showQueryControls">
          &nbsp;⇝ {{ paginationState.rating }} &nbsp; {{ paginationState.level1 || 'all' }} / {{ paginationState.level2 || 'all' }}
        </span>
      </div>

      <div v-if="paginationState.showQueryControls">
        <div class="filter-group">
          <span class="filter-type">Sort by:</span>
          <div class="filter-set">
            <div class="filter" v-for="type in paginationOptions.sortTypes" :key="type">
              <input type="radio" :id="'type-' + type" :value="type" v-model="paginationState.sortType" >
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
              <input type="radio" :id="'sortUp-' + sortUp" :value="sortUp" v-model="paginationState.sortAsc" >
              <label :for="'sortUp-' + sortUp" class="action button">
                <font-awesome-icon :icon="sortUp? 'sort-amount-up' : 'sort-amount-down'" class="flush-right"/>
              </label>
            </div>
          </div>
          <span v-if="paginationState.sortType==='duration' || paginationState.sortType==='name'" class="side-button">
            ⇝
            <button @click="paginationState.showEqualsOnly = !paginationState.showEqualsOnly" class="action button side-button">
              <span class="action-text">
                {{ paginationState.showEqualsOnly? 'disable' : 'enable' }}
              </span> show equals only
              <font-awesome-icon icon="equals" class="flush-right"/>
            </button>
          </span>
          <span v-if="paginationState.sortType==='random'" class="side-button">
            ⇝
            <button @click="shuffle" class="action button side-button">
              <span class="action-text">shuffle ALL </span>
              <font-awesome-icon icon="random" class="flush-right"/>
            </button>
          </span>
          <span v-if="paginationState.sortType==='date watched'" class="side-button">
            ⇝
            <button @click="paginationState.showClearButton = !paginationState.showClearButton" class="action button side-button">
              <span class="action-text">
                {{ paginationState.showClearButton? 'disable' : 'enable' }}
              </span> clear button
              <font-awesome-icon icon="eraser" class="flush-right"/>
            </button>

            <button v-show="paginationState.showClearButton" @click="clearWatchedAt" class="action button side-button clear-all">
              <span class="action-text">clear</span> ALL date-watched data
              <font-awesome-icon icon="eraser" class="flush-right clear-all"/>
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
            <button @click="paginationState.showHideButtons = !paginationState.showHideButtons" class="action button side-button">
              <span class="action-text">
                {{ paginationState.showHideButtons? 'disable' : 'enable' }}
              </span> hide buttons
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
          @toggle-fullwidth="onToggleFullWidth"
          @update-movie="onUpdateMovie"
          @hide-movie="hideMovie"
          @unhide-movie="unhideMovie"
          @remove-movie="removeMovie"
          class="cell-content"
          :showHideButton="paginationState.showHideButtons"
        />
      </div>
    </transition-group>

    
    <div v-if="showPaginationControls" class="controls pagination convert-to-block-on-small-device">
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
            <select 
              class="select-page-number action button"
              v-model="paginationState.nr"
              @change="ensurePaginationStateNrIsNumber"
            >
              <option v-for="val in nrOfPages" :key="val" :value="val">{{val}}</option>
            </select>
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
import MoviePlayerMap from "@/components/MoviePlayerMap";

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
    MoviePlayerMap,
  },
  data() {
    return {
      sortDateDefault: "created",
      ratings: [],
      level1s: [],
      level2s: [],
      filter: { ratings: [], level1s: [], level2s: [] },
      hasFullWidthMovie: false,
      movieBasePath: "/media/movies/",
      isInit: true,
      paginationOptions: {
        sortTypes: ["random", "rating", "date created", "date updated", "date watched", "name", "duration"],
        pageLimits: [4,6,8,12,16,20,24,30,36,60,100],
        ratings: ["0+","0","1","1+","2","2+","3","3+","4","4+","5", "5+", "6"],
        level1s: process.env.VUE_APP_LEVELS1.split(','),
        level2s: process.env.VUE_APP_LEVELS2.split(','),
      },
      paginationState: {
        sortType: "random",
        sortAsc: true,
        limit: 20,
        skip: 0,
        nr: 1,
        rating: "0+",
        level1: "",
        level2: "",
        showQueryControls: false,
        showHideButtons: false,
        showClearButton: false,
        showEqualsOnly: false,
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
    logMessage("Movies created - find all movies")
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
      console.log("p.showQueryControls = " + p.showQueryControls)
      if (!p.pageLimits && p.showQueryControls !== undefined) {
        // new version - use
        this.paginationState = p
        logMessage("Using stored pagination state ", p);
      } else {
        // old version - replace
        logMessage("Using default pagination state ", p);
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
    hideMovie(props) {
      logMessage("Hide movie ", props);
      // save the modifictions
      props.movie.hidden = true;
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
    updateMovie(payload) {
      logMessage("Movies updateMovie", {payload})
      payload.movie[payload.prop] = payload.val
      payload.movie
        .update()
        .then(mv => {
          logMessage("Movie " + payload.prop + " update succesful for ", mv.path);
          this.setFilterData()
        })
        .catch(err => {
          logMessage("ERROR - Movie " + payload.prop + " update ERROR for ", payload.movie.path);
          this.handleError(err);
        });
    },
    onUpdateMovie(payload) {
      this.updateMovie(payload)
    },
    setFilterData() {
      // get list of user-defined ratings and levels, and remove duplicates
      const movies = this.allMoviesforQuery
      logMessage("Movies setFilterData", {movies})
      this.ratings = movies
        .map(m => m.rating)
        .filter((c, i, s) => c!=="" && s.indexOf(c) === i)
        .sort()
      //logMessage("ratings:", this.ratings)

      this.level1s = movies
        .map(m => m.level1)
        .filter((c, i, s) => c && s.indexOf(c) === i)
        .sort()
      logMessage("level1s:", this.level1s)

      this.level2s = movies
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
      logMessage("Movies shuffle")
      this.allMovies.forEach( movie => {
        movie.rnr = Math.round(Math.random()/Math.max(Math.random(), 0.01)*1e5)
        movie.update()
      })
    },
    clearWatchedAt() {
      logMessage("Movies clearWatchedAt")
      this.allMovies.forEach( movie => {
        if (movie.watchedAt) {
          movie.watchedAt = null
          movie.update()
        }
      })
      this.paginationState.showClearButton = false
    },
    toggleSort() {
      this.paginationState.sortAsc = !this.paginationState.sortAsc
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
      const sortInd = this.paginationState.sortAsc ? 1 : -1
      switch (this.paginationState.sortType) {
        case "random":
          sort.rnr = sortInd
          break;
        case "rating":
          sort.rating = sortInd
          // sort the items that have not yet been rated
          // by their random number
          sort.rnr = sortInd
          break;
        case "date created":
          sort.createdAt = sortInd
          break;
        case "date updated":
          sort.updatedAt = sortInd
          break;
        case "date watched":
          sort.watchedAt = sortInd
          // sort the items that have not yet been watched
          // by their random number
          sort.rnr = sortInd
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
      logMessage("Movies movies")
      return this.moviesAmended
    },
    allMovies() {
      logMessage("Movies allMovies")
      // all movies irrespective of query and pagination settings
      return this.user
        ? this.findMoviesInStore({
            query: {}
          }).data
        : []
    },
    allMoviesforQuery() {
      logMessage("Movies allMoviesforQuery")
      // all movies by query irrespective of pagination settings
      let query = { ...this.query}  // shallow clone (bug fix)
      query.$limit=5000
      query.$skip=0
      return this.user
        ? this.findMoviesInStore({
            query: query
          }).data
        : []
    },
    moviesQueryResult() {
      logMessage("Movies moviesQueryResult", {query:this.query})
      return this.user
        ? this.findMoviesInStore({
            query: this.query
          })
        : {data:[],total:0}
    },
    totalNrOfMovies() {
      return this.moviesQueryResult.total
    },
    totalSizeOfMovies() {
      const initialSizeInMB = 0
      const totalSizeInMB = this.allMoviesforQuery.reduce(
        (runningSumSizeInMB, currentMovie) => runningSumSizeInMB + currentMovie.meta.sizeInMB * 1,
        initialSizeInMB
      )
      return totalSizeInMB < 1000 ? Math.round(totalSizeInMB*10)/10 + " MB" : Math.round(totalSizeInMB/10)/100 + " GB"
    },
    moviesAmended() {
      logMessage("Movies moviesAmended")
      //logMessage("this.moviesQueryResult", this.moviesQueryResult)
      let data = this.moviesQueryResult.data

      /* take paginationState.showEqualsOnly into account */
      let filteredData = []
      let lastPushedIndex = -1
      if (this.paginationState.showEqualsOnly && (this.paginationState.sortType==='duration' || this.paginationState.sortType==='name')) {
        logMessage("filtering movies with equal " + this.paginationState.sortType + " only")
        let propNameToTest = this.paginationState.sortType==='duration'? "metaDurationInSec" : "basename"
        data.forEach((m,i) => {
          if(i>0 && m[propNameToTest] === data[i-1][propNameToTest]) {
            if (i-1 !== lastPushedIndex) {
              filteredData.push(data[i-1])
            }
            filteredData.push(m)
            lastPushedIndex = i
          }
        })
      } else {
        filteredData = data
      }

      return filteredData
          /* there's a problem with the feathersjs store implementation where
            sometimes all results are returned instead of the page-set,
            thus the below filter to limit the array size to the page limit
          */
          .filter((m, i) => i < this.paginationState.limit)
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
    showPaginationControls() {
      return this.nrOfPages > 1
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

<style lang="less">
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
.filters {
  margin: 1em 0 4em;
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
span.action-text {
  color: #ddc594;
  font-style: italic;
  font-variant: small-caps;
}
span.side-button{
  margin-left:2em;
}
.action.button.side-button {
  margin-left:1em;
}
.clear-all span.action-text {
  color: #fd6767;
}
.clear-all {
  color: rgba(190, 28, 0, 0.89);
  }
.clear-all:hover,
.clear-all:hover svg {
  color: rgb(253, 38, 0);
}
.grid {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
  margin: 0 -0.2rem 5rem;
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
select.select-page-number.action.button {
  width: auto;
  margin-left: 30px;
  padding: 3px 3px 4px;
}
.controls.pagination {
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 8px 0 20px 0;
  width: 100%;
  text-align: center;
  z-index: 99;
  background-color: #17161c;
  .filter-group {
    border-top: 3px dashed #454545;
    padding-top: 3px;
  }
}
@media all and (max-width: 400px) {
  .grid .grid-cell {
    width: 100%;
    .grid-media {
      max-height: 75vw;
    }
  }
}
@media all and (min-width: 400px) {
  .grid .grid-cell {
    width: 50%;
    .grid-media {
      max-height: 38vw;
    }
  }
}
@media all and (min-width: 800px) {
  .grid .grid-cell {
    width: 33.333%;
    .grid-media {
      max-height: 25vw;
    }
  }
}
@media all and (min-width: 1200px) {
  .grid .grid-cell {
    width: 25%;
    .grid-media {
      max-height: 19vw;
    }
  }
}
@media all and (min-width: 1600px) {
  .grid .grid-cell {
    width: 20%;
    .grid-media {
      max-height: 15vw;
    }
  }
}
@media all and (min-width: 2000px) {
  .grid .grid-cell {
    width: 16.666%;
    .grid-media {
      max-height: 13vw;
    }
  }
}

</style>
