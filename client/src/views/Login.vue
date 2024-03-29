<template>
  <form id="login-form" @submit.prevent="login" novalidate="true">
    <fieldset>
      <legend>Login</legend>
      <div v-if="errors.length" class="errors">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <div>
        <label for="username">Username</label>
        <input
          id="username"
          name="username"
          required
          autofocus
          v-model="user.username"
          @change="clearError"
          type="text"
          pattern="[0-9A-Za-z][0-9A-Za-z ]{0,16}[0-9A-Za-z]"
          placeholder
        >
        <span class="icon"></span>
        <span class="validation">Acceptable</span>
      </div>
      <div>
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          required
          v-model="user.password"
          @change="clearError"
          type="password"
          pattern=".{4,18}"
          placeholder
        >
        <span class="icon"></span>
        <span class="validation">Acceptable</span>
      </div>
      <div class>
        <button v-if="!loading" :disabled="!isValid" class="action button">
          <font-awesome-icon icon="sign-in-alt"/>Login
        </button>
        <button v-if="loading" class="action button loading" disabled>
          in progress..
        </button>
        <span class="register">-or- &nbsp;
          <router-link to="/register">
            <font-awesome-icon icon="user-plus"/>Register
          </router-link>
        </span>
      </div>
      <div v-if="authError" class="auth-error">{{ authError }}</div>
      <div v-if="retryMsg" class="auth-retry">{{ retryMsg }}</div>
    </fieldset>
    <img class="feathers-icon" :src="feathersServerIcon"/>
  </form>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      errors: [],
      user: {
        username: "",
        password: ""
      },
      authError: "",
      retryCntr: 0,
      retryDelay: 10,
      maxRetry: 2,
      retryCountdown: 0,
    };
  },
  computed: {
    isValid() {
      return this.validUsername() && this.validPassword();
    },
    ...mapState("auth", { loading: "isAuthenticatePending" }),
    feathersServerIcon() {
      //display the feathers icon as indication that the server is up and running
      const loc = window.location
      const feathersServer = loc.protocol + "//" + loc.hostname + ":3333"
      console.log("this:",this)
      return feathersServer + "/favicon.ico"
    },
    retryMsg() {
      return this.retryCountdown > 0 ? "Retry in " + this.retryCountdown + " seconds (" + this.retryCntr + ")": ""
    },
  },
  methods: {
    ...mapActions("auth", ["authenticate"]),
    login(evt) {
      this.clearError()
      this.clearRetry()
      if (this.validForm()) {
        //submit form
        console.log("submitting login form");
        this.authenticate({
          strategy: "local",
          ...this.user
        })
          .then(resp => {
            console.log("logged in: ", resp);
            this.$router.push("/");
          })
          .catch(e => {
            console.error("Authentication error: ", e);
            this.authError = e.message;
            this.retryLogin()
          });
      }
      if(evt) evt.preventDefault();
    },
    retryLogin() {
      if (this.retryCntr<this.maxRetry) {
        this.retryCountdown = this.retryDelay
        this.cntDwnIntv = setInterval(()=>this.retryCountdown--, 1000)
        setTimeout(this.login, this.retryCountdown*1000) 
        this.retryCntr++
      }
    },
    clearRetry() {
      clearInterval(this.cntDwnIntv)
    },
    clearError() {
      this.authError = ""
    },
    validForm() {
      // form has html5 validation
      // do some js validation as backup
      let err = (this.errors = []);
      if (!this.validUsername()) {
        err.push("Username is invalid.");
      }
      if (!this.validPassword()) {
        err.push("Password is invalid.");
      }
      return err.length === 0;
    },
    validUsername() {
      var re = /^[0-9A-Za-z][0-9A-Za-z ]{0,16}[0-9A-Za-z]$/;
      return re.test(this.user.username);
    },
    validPassword() {
      var re = /^.{4,18}$/;
      return re.test(this.user.password);
    }
  }
};
</script>

<style scoped lang="less">
#login-form {
  margin-top: 5em;
}
.validation {
  visibility: hidden;
  margin-left: 5px;
  font-size: 0.65rem;
  color: #e67d09;
}
input:valid + span + span.validation {
  color: #26b72b;
  visibility: visible;
}
.errors,
.auth-error {
  font-size: 0.85rem;
  color: #e67d09;
}
.auth-retry,
.auth-error {
  margin-left: 0.2em;
}
.auth-retry {
  font-size: 0.85rem;
  font-style: italic;
}
ul {
  margin: 0 -1em 1em 0;
}
.register {
  margin-left: 1em;
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}
label {
  display: flex;
}
.feathers-icon {
  vertical-align: top;
  margin: 10px 0 0 10px;
}
</style>
