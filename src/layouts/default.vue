<template>
  <div>
	<b-navbar toggleable="md" type="dark" variant="info">

		<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

		<b-navbar-brand href="/">Survey Dapp</b-navbar-brand>

		<b-collapse is-nav id="nav_collapse">

			<b-navbar-nav>
			<b-nav-item @click="createQuestionnaire()">Create Questionnaire</b-nav-item>			
			</b-navbar-nav>

			<!-- <b-collapse is-nav id="nav_text_collapse">
				<b-navbar-nav>
					<b-nav-text>Current Account: {{ this.$store.state.web3Instance.currentAccount }}</b-nav-text>
				</b-navbar-nav>
        	</b-collapse> -->

			<!-- <b-nav-item-dropdown right> -->
				<!-- Using button-content slot -->
				<!-- <template slot="button-content">
				<em>User</em>
				</template>
				<b-dropdown-item href="#">Profile</b-dropdown-item>
				<b-dropdown-item href="#">Signout</b-dropdown-item>
			 </b-nav-item-dropdown> -->

		</b-collapse>
	</b-navbar>

    <nuxt/>
  </div>
</template>


<script>


export default {
	methods: {
		createQuestionnaire() {
			this.$router.push({ path: '/createQuestionnaire/' })
		}
	}
}
</script>

<style>
</style>
