<template>
  <div>
    <h1>
      <font-awesome-icon icon="film"/>Movies
    </h1>

    <MoviePlayerMap/>
    
    <div id="controls" class="controls filters convert-to-block-on-small-device">

      <div>
        <span class="pagination-info">
          Page {{ pageNr }} of {{ nrOfPages }} <span class="info" v-if="!showEqualsOnly">({{ totalNrOfMovies }} movies - {{ totalSizeOfMovies }})</span>
        </span>

        <button v-show="!showEqualsOnly" @click="paginationState.showQueryControls = !paginationState.showQueryControls" class="action button">
          <span class="action-text">
            {{ paginationState.showQueryControls? 'hide' : 'show' }}
          </span> query filters
          <font-awesome-icon icon="filter" class="flush-right"/>
        </button>

        <span class="info" v-if="!paginationState.showQueryControls && !showEqualsOnly">
          &nbsp;⇝ {{ paginationState.rating }} &nbsp; {{ paginationState.level1 || 'all' }} / {{ paginationState.level2 || 'all' }}
        </span>
      </div>

      <transition name="slidefade">
      <div v-show="paginationState.showQueryControls && !showEqualsOnly" 
        class="query-filters"
        :class="{fadedcontrols:fadeControls}"
      >
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

          <span v-if="paginationState.sortType==='random'" class="side-button">
            ⇝
            <button @click="shuffle" class="action button side-button">
              <span class="action-text">shuffle </span> ALL
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
          <span class="filter-type">Duration:</span>
          <span
            class="action button cntr clear"
            :class="{checked: !(paginationState.duration.min || paginationState.duration.max) }"
            @click="clearDurationRange"
          >all</span>
          ➔
          <div class="filter-set">
            <span
              class="check clear"
              :class="{checked: (paginationState.duration.min || paginationState.duration.max),fadedcontrols:hasNewDurationLimits }"
            ></span>
            <label for="duration-min1" class="text-label">From</label>
            <select id="duration-min1"
              class="select-duration-limit action button"
              v-model="durationRange.min[0]"
            >
              <option v-for="val in paginationOptions.durationHours" :key="val" :value="val">{{val}} h</option>
            </select>
            <span class="hr-min-separator">:</span>
            <select id="duration-min2"
              class="select-duration-limit action button"
              v-model="durationRange.min[1]"
            >
              <option v-for="val in paginationOptions.durationMinutes" :key="val" :value="val">{{val}} m</option>
            </select>


            <label for="duration-max1" class="text-label">To</label>
            <select id="duration-max1"
              class="select-duration-limit action button"
              v-model="durationRange.max[0]"
            >
              <option v-for="val in paginationOptions.durationHours" :key="val" :value="val">{{val}} h</option>
            </select>
            <span class="hr-min-separator">:</span>
            <select id="duration-max2"
              class="select-duration-limit action button"
              v-model="durationRange.max[1]"
            >
              <option v-for="val in paginationOptions.durationMinutes" :key="val" :value="val">{{val}} m</option>
            </select>

            <span> </span>
            <button @click="setDurationRange" 
              v-if="validDurationRange"
              class="action button side-button"
              :class="{fadedcontrols:!hasNewDurationLimits}"
            >
              <span class="action-text">apply</span> limits
            </button>
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
      </transition>


      <div class="ctrl-group">
        <span class="ctrl-type">Check for duplicates:</span>
        <span
          class="action button cntr clear"
          :class="{checked: !duplicationCheckSelection}"
          @click="clearDuplicationCheckSelection"
        >off</span>
        <div class="ctrl-set">
          <div class="ctrl" v-for="dCOpt in duplicationCheckOptions" :key="'qr-'+dCOpt">
            <input type="radio" :id="'qdCOpt-' + dCOpt" :value="dCOpt" v-model="duplicationCheckSelection" >
            <label :for="'qdCOpt-' + dCOpt" class="action button">
              by {{ dCOpt }}
            </label>
          </div>
        </div>
      </div>


      <transition name="slidefade">
      <div v-show="!showEqualsOnly" class="ctrl-group">
        <span class="ctrl-type">Show video previews:</span>
        <div class="ctrl-set">
          <div class="filter" v-for="showPreviews in [true,false]" :key="showPreviews">
            <input type="radio" :id="'showPreviews-' + showPreviews" :value="showPreviews" v-model="autoEmbedPlayer" >
            <label :for="'showPreviews-' + showPreviews" class="action button">
              {{ showPreviews? 'automatic' : 'manual' }}
            </label>
          </div>
        </div>
      </div>
      </transition>

    </div>

    <div v-if="loading" class="loading">loading...</div>
    <div v-if="!resultsFound" class="noresults">{{ noResultsText }}</div>
    
    <button @click="MarkMoviesTestedForEqual" 
      v-if="resultsFound && showEqualsOnly"
      class="action button"
    >
      <span class="action-text">mark</span> reviewed for {{ this.duplicationCheckSelection }} duplication
    </button>

    <div class="right-aligned">
      <button @click="showMoviesList=!showMoviesList" 
        v-if="!loading && movies && movies[0]"
        class="action button"
      >
        <span class="action-text">show</span> {{ showMoviesList? "grid with videos": "list of filenames"}}
      </button>
    </div>

    <transition-group
      v-if="!loading && !showMoviesList && movies && movies[0]"
      tag="div"
      name="movies-list"
      id="movies-list"
      class="grid movies-list"
      :class="{'review-equals':showEqualsOnly}"
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
          :autoEmbedPlayer="autoEmbedPlayer"
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

    <div class="cmd-list-rm" v-if="queryHidden && resultsFound">
      # to delete all hidden movies using the command line:<br>
      # cd to media folder
      <div
        v-for="movie in allMoviesforQuery"
        :key="movie._id"
        :id="movie._id"
      >
        rm -i {{movie.path}} #<br>
      </div>
    </div>

    <div class="movie-names-list grid" v-if="showMoviesList && resultsFound">
      <div
        v-for="movie in allMoviesforQuery"
        :key="movie._id"
        :id="movie._id"
        class="grid-cell"
      >
        {{ movie.basename.replace(".mp4","") }}
      </div>
    </div>

    <div v-if="showPaginationControls && !showMoviesList" class="controls pagination convert-to-block-on-small-device">
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
            <select id="page-nr"
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
      eqProps: {
        "duration": "eqd",
        "name": "eqn"
      },
      duplicationCheckOptions: ["duration", "name"],
      duplicationCheckSelection: "",
      paginationOptions: {
        sortTypes: ["random", "rating", "date created", "date updated", "date watched", "name", "duration"],
        pageLimits: [4,6,8,12,16,20,24,30,36,60,100],
        ratings: ["0+","0","1","1+","2","2+","3","3+","4","4+","5", "5+", "6"],
        durationHours: [0,1,2,3,4,5],
        durationMinutes: [0,5,10,15,20,25,30,35,40,45,50,55],
        level1s: process.env.VUE_APP_LEVELS1.split(','),
        level2s: process.env.VUE_APP_LEVELS2.split(','),
      },
      durationRange: {
        min:[null,null],
        max:[null,null],
      },
      paginationState: {
        sortType: "random",
        sortAsc: true,
        limit: 4,
        skip: 0,
        nr: 1,
        rating: "0+",
        level1: "",
        level2: "",
        duration: {
          min:null,
          max:null,
        },
        showQueryControls: false,
        showHideButtons: false,
        showClearButton: false,
        preventScroll: false,
      },
      hasNewDurationLimits: false,
      startFrameTimeForEquals: 99,
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
        metaDurationInSec: {}
      },
      intSecObsv: {
        activeIDs: [],
      },
      autoEmbedPlayer: true,
      minMovieCellHeight: 0,
      minMovieCellHeightDefault: 300,
      showMoviesList: false,
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
    logMessage("MOVIES module mounted - INITIALIZE")
    this.init()
  },
  methods: {
    ...mapActions("movies", { findMovies: "find" }),
    init() {
      let p = retrievePaginationState(this.paginationState)
      // backwards compatibility test:
      // ignore stored state if it contains a pageLimits property
      //console.log("p.showQueryControls = " + p.showQueryControls)
      if (!p.pageLimits && p.showQueryControls !== undefined && p.duration !== undefined) {
        // new version - use
        if (!this.showEqualsOnly) {
          this.paginationState = p
          logMessage("Using stored pagination state ", p);
        }
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
    MarkMoviesTestedForEqual() {
      let movies = this.moviesAmended
      let eqPropName = this.eqProps[this.paginationState.sortType]
      logMessage("Movies tested for equal " + this.paginationState.sortType, movies)
      movies.forEach((m) => {
        this.updateMovie({movie:m, prop:eqPropName, val:1})
      })
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
    clearDurationRange() {
      this.durationRange.min = [null,null]
      this.durationRange.max = [null,null]
      this.paginationState.duration.min = null
      this.paginationState.duration.max = null
    },
    setDurationRange() {
      logMessage("set durationrange", {durationRange: this.durationRange})
      let minSecs = this.convertHrsMinsToSecs(this.durationRange.min[0], this.durationRange.min[1])
      let maxSecs = this.convertHrsMinsToSecs(this.durationRange.max[0], this.durationRange.max[1])
      logMessage("set durationrange", {durationRange: this.durationRange, minSecs, maxSecs})
      if (maxSecs > minSecs || (minSecs > 0 && maxSecs === 0)) {
        if (maxSecs === 0) {
          maxSecs === null
        }
        this.paginationState.duration = {
          min: minSecs,
          max: maxSecs,
        }
      } else {
        this.paginationState.duration = {
          min: null,
          max: null,
        }
      }
      this.hasNewDurationLimits = false
    },
    resetPage() {
      logMessage("in resetPage")
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
    clearDuplicationCheckSelection() {
      this.duplicationCheckSelection = ""
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
    convertHrsMinsToSecs(hrs,mins) {
      return 60 * (60 * hrs + 1 * mins)
    },
    preventScroll() {
      // temporarily prevent the movie list from scrolling
      this.paginationState.preventScroll = true
      this.$nextTick(() => {
        this.paginationState.preventScroll = false
      })
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
    fadeControls() {
      logMessage("fadeControls ", this.loading)
      return this.loading
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
          // sort items with same duration by their name
          sort.basename = 1
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
      query.$limit=8192
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
    showEqualsOnly() {
      return this.duplicationCheckSelection !== ""
    },
    moviesAmended() {
      //logMessage("Movies moviesAmended")
      logMessage("Movies moviesAmended", {moviesQueryResult: this.moviesQueryResult})
      let data = this.moviesQueryResult.data

      /* take showEqualsOnly into account */
      let filteredData = []
      let lastPushedIndex = -1

      if (this.showEqualsOnly) {
        logMessage("filtering movies with equal " + this.duplicationCheckSelection + " only")
        let propNameToTest = this.duplicationCheckSelection==='duration'? "metaDurationInSec" : "basename"
        let eqPropName = this.eqProps[this.duplicationCheckSelection]
        logMessage("eqPropName", eqPropName)

        let searchEquals = true
        let equalsFound = false
        let untestedFound = false
        let i = 1
        let iMax = data.length
        // because the movie array is ordered by the property 
        // for which to test equality, a while loop can be used
        // which can be exited as soon as duplicates are found
        // followed by a unequal value.
        while(i<iMax && searchEquals) {
          let curM = data[i]
          let prevM = data[i-1]
          if(curM[propNameToTest] === prevM[propNameToTest]) {
            if (i-1 !== lastPushedIndex) {
              filteredData.push(prevM)
              if (prevM[eqPropName]!==1) {untestedFound = true}
            }
            filteredData.push(curM)
            if (curM[eqPropName]!==1) {untestedFound = true}
            lastPushedIndex = i
            equalsFound = true
          } else if(equalsFound) {
            if (untestedFound) {
              //stop search
              searchEquals = false
            } else {
              //resume new search
              filteredData = []
              lastPushedIndex = -1
            }
          }
          i++
        }
      } else {
        filteredData = data
      }
      logMessage("Movies moviesAmended", {filteredData})
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

            if (this.showEqualsOnly) {
              logMessage("showEqualsOnly", {m_sft:m.sft})
              if (m._sft_orig === undefined) {
                // prevent double assignment
                if (m.sft !== undefined) {
                  m._sft_orig = 1*m.sft
                } else {
                  m._sft_orig = null
                }
                //console.log({m})
                if (m.metaDurationInSec > 2* this.startFrameTimeForEquals) {
                  m.sft = 1*this.startFrameTimeForEquals
                } else {
                  m.sft = Math.ceil(m.metaDurationInSec / 2)
                }
                
                logMessage("setting sft to " + 1*m.sft + "  orig=" + 1*m._sft_orig)
              }
            } else {
              logMessage("NOT showEqualsOnly", {m_sft_orig:m._sft_orig})
              if(m._sft_orig !== undefined) {
                if (m._sft_orig===null) {
                  delete m.sft
                } else {
                  m.sft = 1*m._sft_orig
                  
                logMessage("re-setting sft to " + 1*m.sft)
                }
                delete m._sft_orig
              }
            }

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
    },
    pageSortType() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.sortType
    },
    selectedDurationRange() {
      // define computed item of nested property so we can watch it easier below
      return this.durationRange.min[0] + "~" + this.durationRange.min[1] + "~" + this.durationRange.max[0] + "~"+ this.durationRange.max[1]
    },
    pageDurationRange() {
      // define computed item of nested property so we can watch it easier below
      return this.paginationState.duration.min + "-" + this.paginationState.duration.max
    },
    validDurationRange() {
      let hasValidInput = false
      let min = this.durationRange.min
      let max = this.durationRange.max
      let minSecs = this.convertHrsMinsToSecs(min[0],min[1])
      let maxSecs = this.convertHrsMinsToSecs(max[0],max[1])
      let hasInput = !(min[0]===null && min[1]===null && max[0]===null && max[1]===null)
      if (hasInput) {
        hasValidInput = maxSecs > minSecs
      }
      return hasValidInput;
    },
  },
  watch: {
    pageNr(newVal, oldVal) {
      if (!this.isInit) {
        logMessage("page Nr changed from " + oldVal + " to " + newVal)
        if (!this.paginationState.preventScroll) {
          // scroll to top of movies list
          const listEl = document.getElementById("movies-list")
          const el = document.getElementById("controls")
          const rect = el.getBoundingClientRect()
          let topDelta = rect.bottom - rect.top + 234
          logMessage("scroll to " + topDelta)
          listEl.style="min-height:100vh;"
          window.scrollTo({top:100, left:0, behavior:'instant'})
          window.scrollTo({top:topDelta, left:0, behavior:'smooth'})
          listEl.style=""
        }
        this.paginationState.skip = this.paginationState.limit * (1 * this.paginationState.nr - 1)
      }
    },
    pageLimit(newVal, oldVal) {
      if (!this.isInit) {
        logMessage("page Limit changed from " + oldVal + " to " + newVal)
        this.preventScroll()
        this.paginationState.nr = 1 + Math.floor((this.paginationState.nr - 1)*(oldVal/newVal))
        this.paginationState.skip = (this.paginationState.nr - 1) * newVal
      }
    },
    pageRating(newVal, oldVal) {
      logMessage("page Rating changed from " + oldVal + " to " + newVal)
      this.preventScroll()
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
      this.preventScroll()
      if (newVal !== "") {
        this.filterQuery.level1 = newVal
      } else {
        this.filterQuery.level1 = ""
      }
      this.resetPage()
    },
    pageLevel2(newVal, oldVal) {
      logMessage("page Level2 changed from " + oldVal + " to " + newVal)
      this.preventScroll()
      if (newVal !== "") {
        this.filterQuery.level2 = newVal
      } else {
        this.filterQuery.level2 = ""
      }
      this.resetPage()
    },
    selectedDurationRange(newVal,oldVal){
      logMessage("page duration range selection changed from ", oldVal, " to ", newVal)
      let timeDeltaM = this.paginationOptions.durationMinutes[1]
      let maxM = this.paginationOptions.durationMinutes[this.paginationOptions.durationMinutes.length - 1]
      let maxH = this.paginationOptions.durationHours[this.paginationOptions.durationHours.length - 1]

      let oldValArr = oldVal.split("~")
      let oldMinH = 1*oldValArr[0]
      let oldMinM = 1*oldValArr[1]
      let oldMaxH = 1*oldValArr[2]
      let oldMaxM = 1*oldValArr[3]
      let newValArr = newVal.split("~")
      let newMinH = 1*newValArr[0]
      let newMinM = 1*newValArr[1]
      let newMaxH = 1*newValArr[2]
      let newMaxM = 1*newValArr[3]

      if ( !(isNaN(newMinH) && isNaN(newMinM) && isNaN(newMaxH) && isNaN(newMaxM)) ) {
        this.hasNewDurationLimits = true
        oldMinH = isNaN(oldMinH)? 0 : oldMinH
        oldMaxH = isNaN(oldMaxH)? 0 : oldMaxH
        oldMinM = isNaN(oldMinM)? 0 : oldMinM
        oldMaxM = isNaN(oldMaxM)? 0 : oldMaxM
        newMinH = isNaN(newMinH)? 0 : newMinH
        newMaxH = isNaN(newMaxH)? 0 : newMaxH
        newMinM = isNaN(newMinM)? 0 : newMinM
        newMaxM = isNaN(newMaxM)? 0 : newMaxM
        if (oldMaxM - oldMinM > timeDeltaM) {
          timeDeltaM = oldMaxM - oldMinM
        } else if (oldMaxM - oldMinM < 0) {
          timeDeltaM = 60 + oldMaxM - oldMinM
        }
        logMessage("timeDeltaM", timeDeltaM)
        if (newMinH !== oldMinH) {
          newMaxH = oldMaxH + (newMinH - oldMinH)
        }
        if (newMinM !== oldMinM) {
          if (newMinM < 60 - timeDeltaM) {
            newMaxM = newMinM + timeDeltaM
          } else {
            newMaxM = newMinM - 60 + timeDeltaM
            if (newMaxM < oldMaxM) {
              newMaxH = oldMaxH + 1
            }
          }
          if (newMinM < oldMinM && newMaxM > oldMaxM) {
            newMaxH = oldMaxH - 1
          }
        }
        if (newMaxH > maxH) {
          newMaxH = maxH
          newMaxM = maxM
        }
        if (60*newMaxH + newMaxM < 60*newMinH + newMinM) {
          newMaxH = newMinH
          newMaxM = newMinM
        }
        
        this.durationRange = {
          min: [newMinH, newMinM],
          max: [newMaxH, newMaxM]
        }
      }
    },
    pageDurationRange(newVal, oldVal) {
      logMessage("page duration range changed from ", oldVal, " to ", newVal)
      this.preventScroll()
      let newValArr = newVal.split("-")
      let newMin = newValArr[0]
      let newMax = newValArr[1]
      logMessage("page duration range changed from ", oldVal, " to ", newVal, {newMin,newMax})
      let hasMinVal = newMin !== "null" && newMin !== "" && newMin !== 0
      let hasMaxVal = newMax !== "null" && newMax !== "" && newMax !== 0
      if (hasMinVal && hasMaxVal) {
        this.filterQuery.metaDurationInSec = {
          $gte: 1*newMin,
          $lte: 1*newMax
        }
      } else if (hasMinVal) {
        this.filterQuery.metaDurationInSec = {
          $gte: 1*newMin
        }
      } else if (hasMaxVal) {
        this.filterQuery.metaDurationInSec = {
          $lte: 1*newMax
        }
      } else {
        this.filterQuery.metaDurationInSec = {}
      }
      logMessage("pageDurationRange", {metaDurationInSec: this.filterQuery.metaDurationInSec})
      this.resetPage()
    },
    showEqualsOnly(newVal, oldVal) {
      logMessage("showEqualsOnly changed from " + oldVal + " to " + newVal)
      if (newVal) {
        this.origAutoEmbedPlayer = this.autoEmbedPlayer?true:false
        this.origPaginationState = {...this.paginationState}
        // employ a trick to reset all movies so that the temporary
        // start frame time can take effect
        this.preventPaginationStatePersist = true
        this.paginationState.limit = 1
        this.paginationState.skip = 0
        this.movies
        this.autoEmbedPlayer = true
        //this.$nextTick(() => {
          // temporarily show all duplicates on one page
          // ensure that all filters are cleared
          this.paginationState = {
            sortType: this.duplicationCheckSelection,
            sortAsc: true,
            limit: 9999,
            skip: 0,
            nr: 1,
            rating: "0+",
            level1: "",
            level2: "",
            duration: {
              min:null,
              max:null
            },
            showQueryControls: false,
            showHideButtons: true,
            showClearButton: false,
          }

          this.resetPage()
        //})
      } else {
        // employ a trick to reset all movies so that the temporary
        // start frame time can be made undone effectively
        this.paginationState.limit = 1
        this.paginationState.skip = 0
        this.movies
        this.$nextTick(() => {
          // reset to normal
          if (this.origPaginationState) {
            this.paginationState = {...this.origPaginationState}
            delete this.preventPaginationStatePersist
            delete this.origPaginationState
            this.autoEmbedPlayer = this.origAutoEmbedPlayer?true:false
          }
          this.resetPage()
        })
      }
      this.resetPage()
    },
    paginationState: {
      deep: true,
      handler: function(newVal) {
        if (!this.preventPaginationStatePersist) {
          logMessage("persist new paginationState", newVal)
          persistPaginationState(newVal)
        }
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
    },
    autoEmbedPlayer(newVal) {
      this.minMovieCellHeight = newVal? this.minMovieCellHeightDefault : 0
    },
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
.query-filters {
  border: 1px dashed #454545;
  border-radius:9px;
  padding: .5em;
  margin-bottom: 1em;
}
.fadedcontrols svg,
.fadedcontrols .action-text,
.fadedcontrols .action,
.fadedcontrols {
  color: #545454!important;
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
.text-label {
  color: #e9e4f2;
  font-weight: 400;
  margin: 0 .3em 0 1em;
  font-style: italic;
}
.hr-min-separator {
  font-weight: 600;
  margin: 0 .3em;
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
.grid.movie-names-list {
  flex-direction: column;
  height: 93vh;
}
.grid.review-equals {
  margin-bottom: 450px;
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
.cmd-list-rm {
  border: 1px solid #f90;
  color: #f90;
  padding: 1em;
  margin-bottom:9em;
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

.slidefade-enter-active,
.slidefade-leave-active {
  transition: all 0.4s ease-in-out, transform 0.4s ease-in-out;
  transform: scaleY(1);
  max-height: 369px;
}
.slidefade-enter,
.slidefade-leave-to {
  transform: scaleY(0);
  max-height: 0;
}
.fade-up-enter-active,
.fade-up-leave-active,
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.4s ease-in-out, transform 0.4s ease-in-out;
}
.fade-down-enter,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-9px);
}

.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(9px);
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
      max-height: 31vw;
    }
  }
}
@media all and (min-width: 800px) {
  .grid .grid-cell {
    width: 33.333%;
    .grid-media {
      max-height: 20vw;
    }
  }
}
@media all and (min-width: 1200px) {
  .grid .grid-cell {
    width: 25%;
    .grid-media {
      max-height: 15vw;
    }
  }
}
@media all and (min-width: 1600px) {
  .grid .grid-cell {
    width: 20%;
    .grid-media {
      max-height: 12vw;
    }
  }
}
@media all and (min-width: 2000px) {
  .grid .grid-cell {
    width: 16.666%;
    .grid-media {
      max-height: 10vw;
    }
  }
}

</style>
