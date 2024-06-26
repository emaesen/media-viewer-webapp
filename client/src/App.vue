<template>
  <div id="app">
    <header id="header">
      <a href="/"><img src="/img/icons/favicon-32x32.png" class="icon"/></a>
      <div class="header">Media Viewer</div>
    </header>
    <div id="auth">
      <div v-if="user" class="auth-state">
        <span class="info">
          <font-awesome-icon icon="user-check"/>
          <span class="remove-on-small-device">Logged in as</span>
          {{ userName }}
        </span>
        <button @click="logout" class="action button">
          <font-awesome-icon icon="sign-out-alt"/><span class="action-text">logout</span>
        </button>
      </div>
    </div>
    <main id="main">
      <router-view/>
    </main>

    <footer class="build-info">
      {{ buildInfoText }} 
    </footer>
  </div>
</template>


<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  components: {
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapState("auth", { user: "user" }),
    userName() {
      console.log({ user: this.user });
      return "“" + this.user.username + "” ➔ ";
    },
    buildInfoText() {
      const options = { dateStyle: "medium", timeStyle: "short" };
      if (process.env.NODE_ENV==="development") {
        return "Dev hot reload: " + (new Date()).toLocaleString('en-US', options);
      } else {
        const buildAt = process.env.VUE_APP_BUILD_AT
        if (buildAt) {
          return "Build: " + (new Date(buildAt)).toLocaleString('en-US', options);
        }
        return ""
      }
    },
  },
  methods: {
    ...mapActions("auth", { authLogout: "logout" }),
    logout() {
      console.log("logging out...");
      this.authLogout()
        .then(() => this.$router.push("login"))
        .catch((err) => console.error({err}))
    }
  },
};
</script>

<style lang="less">
*,
:after,
:before {
  box-sizing:border-box;
}
body {
  background-color: #17161c;
  margin: 9px;
}
body,
input,
textarea,
select,
option,
button {
  color: #e9e4f2;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #90d9f5;
}
h1 {
  margin: 2.5em 0 1em;
}
h2 {
  margin: 1em 0 0.5em;
}
#app {
  position: relative;
}
#main {
  min-height: calc(100vh - 180px);
}
#header,
.build-info {
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 999;
  background-color: #000;
  font-family: monospace;
  text-align: center;
  color: #90d9f5;
}
#header {
  top: 0;
  padding: 3px 0;
  border-bottom: 5px solid #333;
  opacity: 0.8;
}

.build-info{
  bottom: 0;
  border-top: 5px solid #333;
  opacity: 0.6;
  letter-spacing: .45em;
  font-size: 72%;
  text-transform: uppercase;
  margin-top: 90px;
}

#header .date,
#header .time {
  display: inline-block;
}
#header .date::after {
  content: ",";
  margin-right: 1em;
}
.header {
  letter-spacing: 1em;
  padding-left: 1em;
  font-size: 72%;
  text-transform: uppercase;
}
section {
  padding: 5px;
  background-color: #393744;
  border: 1px solid #2c2b31;
  border-radius: 5px;
  position: relative;
  margin: 2em 0 3em;
}
hr {
  border-color: #aca0a072;
  margin: 0.5em 0 0.3em;
}
ul {
  padding-inline-start: 0;
  margin-block-start: 0.5em;
}
ul ul {
  padding-inline-start: 1em;
  margin-block-start: 0;
  margin-block-end: 0.2em;
}
li {
  list-style-type: none;
}
fieldset {
  border: 1px solid #555;
  border-radius: 10px;
  display: inline-block;
}
legend {
  margin: 1em 0;
  font-size: 1.1rem;
}
label {
  display: flex;
  margin-left: 0.3em;
  font-weight: bold;
  letter-spacing: 1px;
  font-style: italic;
  color: #cec0a1;
}
textarea {
  min-height: 4em;
  height: 8em;
  width: 90%;
  width: -moz-available;
  width: -webkit-fill-available;
}
input.short {
  width: 7em;
}
input,
textarea,
select,
button {
  background-color: rgba(231, 231, 231, 0.18);
  color: #bdb1bd;
  font-weight: 600;
  border: 1px solid #8270ad;
  border-radius: 5px;
  padding: 5px 10px;
  margin: 0 .25em 1em;
}
textarea::placeholder,
input::placeholder {
  color: rgba(255, 202, 58, 0.87);
  font-weight: 400;
  font-style: italic;
}
input:focus,
textarea:focus {
  outline-color: #888;
  outline-width: 1px;
  color: #050505;
  background-color: rgba(207, 206, 204, 0.938);
}
button:focus {
  outline: none;
}
input[type="number"] {
  width: 5rem;
}
input[type="submit"] {
  cursor: pointer;
}
input[type="submit"]:not(.inactive):hover {
  border-color: #888;
}
input[type="submit"]:disabled,
button:disabled {
  cursor: default;
  color: #e9e4f250;
}
input[type="submit"].loading:disabled {
  color: #e9e4f290;
}
input:invalid + span.icon:after {
  content: "✖";
  color: #f00;
  padding-left: 5px;
}
input:valid + span.icon:after {
  content: "✓";
  color: #26b72b;
  padding-left: 5px;
}
pre {
  margin: 0.5em;
  padding: 0.5em;
}
code {
  padding: 0 0.2em;
}
pre,
code {
  color: #daefff;
}
img.icon{
  position: absolute;
  left: 2px;
  top: 0;
  background-color: #fff;
  border: 1px solid #fff;
  opacity: 0.8;
}
#auth {
  position: absolute;
  right: 9px;
  a {
    font-weight: bold;
    &.router-link-exact-active {
      color: #edf2e4;
      cursor: default;
    }
  }
}
a,
.action {
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 1px;
  color: #bdb1db;
  font-style: normal;
}
.action.button {
  vertical-align: middle;
  font-weight: bold;
  border: 1px solid #62518c;
  background-color: #3e2200;
  padding: 2px 5px;
  margin: 5px 0;
  display: inline-block;
  border-radius: 5px;
  line-height: 21px;
}
.action.button.side-margin5 {
  margin-left: 5px;
  margin-right: 5px;
}
button,
.action.button {
  background-color: transparent;
  border: 1px solid #8270ad;
}
.action.button + .action.button {
  margin-left: 5px;
}
button,
.actionable {
  cursor: pointer;
}
button:not(.inactive):hover,
.action.button:not(.inactive):hover {
  background-color: #351212;
}
.actionable {
  margin: -4px;
  padding: 4px;
}
.actionable:not(.inactive):hover {
  background-color: #1f0303;
}
span.action-text {
  color: #ddc594;
  font-style: italic;
  font-variant: small-caps;
}
.loading,
.noresults {
  color: #ffa04c;
  font-style: italic;
  min-height: 25vw;
}
.button.loading {
  min-height: 0;
}
.info {
  color: #e9e4f272;
}
.alert {
  background-color: #300;
  margin: 0 -10px -10px;
  padding: 0 10px 10px;
}
.nowrap {
  white-space: nowrap;
}
.inline-block {
  display: inline-block;
}

input,
label {
  display: inline-block;
}
input[type="radio"],
input[type="checkbox"] {
  visibility: hidden;
  width: 1em;
}

span.check {
  margin-left: 0.5em;
  margin-right: -.7em;
  font-weight:bold;
}
span.clear::before,
input[type="radio"] + label:not(.nocheck)::before,
input[type="checkbox"] + label:not(.nocheck)::before {
  content: "✓ ";
  opacity: .18;
}
span.clear.checked::before,
input[type="radio"]:checked + label:not(.nocheck)::before,
input[type="checkbox"]:checked + label:not(.nocheck)::before {
  content: "✓ ";
  color: #29dc58;
  opacity: 1;
}
.fade {
  opacity:.3;
}
span.clear.checked.fadedcontrols::before {
  opacity: .5;
}
.action.button.clear {
  margin-left: 0.9em;
}
label.action.button {
  margin-left: -0.9em;
  min-width: 1.3em;
  text-align: center;
}
label {
  margin-left: -0.2em;
  margin-right: 0.3em;
}
label.inactive,
label.no_change_when_clicked,
label.no_results_when_clicked {
  opacity: .45;
}
.filter-set, .ctrl-set {
  display: inline-block;
}
.filters {
  padding: 5px;
}
.filter, .ctrl {
  display: inline-block;
}
.none {
  color: #948972;
}
.filter-type, .ctrl-type {
  display: inline-block;
  min-width: 3.5em;
}
.right-aligned {
  text-align: right;
}
/* "clearfix" */
.group:after {
  content: "";
  display: table;
  clear: both;
}
.float {
  float: left;
}
.float.right {
  float: right;
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.top {
  top: 0;
}
.right {
  right: 0;
}
.right.spaced {
  right: 5px;
}
.left-margin5 {
  margin-left: 5px;
}
.right-margin5 {
  margin-right: 5px;
}
.side-margin5 {
  margin-left: 5px;
  margin-right: 5px;
}
.auth-state {
  display: inline;
}
.hidden {
  visibility: hidden;
}
.svg-inline--fa {
  color: #cec0a1;
  margin-right: 0.3em;
}

.svg-inline--fa.activated {
  color: #80d14a;
}
.svg-inline--fa.flush-right {
  margin-right: 0;
}
::-webkit-scrollbar {
  background-color: #676479;
  width: 9px;
  height: 9px;
  border-radius: 9px;
}
::-webkit-scrollbar-track {
  border-radius: 9px;
}
::-webkit-scrollbar-thumb {
  background-color: #c6c1e4;
  border-radius: 9px;
  border: 1px solid #676479;
}
@media all and (max-width: 700px) {
  .remove-on-small-device {
    display: none !important;
  }
  .convert-to-block-on-small-device {
    display: block !important;
  }
  body,
  input,
  textarea,
  select,
  option,
  button {
    font-size: 12px;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    letter-spacing: normal;
  }
  .header,
  .build-info{
    letter-spacing: .27em;
  }
}
</style>
