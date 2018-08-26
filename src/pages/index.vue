<template>
  <section>
		<div>
			Current Account: {{ this.currentAccount }}
		</div>
		<div v-if="questionnires.length !== 0" v-for="q in questionnires" :key="q.questionnaireKey">
			<b-card no-body>
				<b-card-body>
					<b-link to="/">
					<h4>{{ q.title }}</h4>
					</b-link>
					<p class="card-text">
					<b>Current Participants : {{ q.question.actualParticipants }}</b> <br />
					<b>Max participants : {{ q.question.maxParticipants }}</b> <br />
					<b>Total Rewards in Pool(Ether) : {{ q.question.rewards }}</b>
					</p>
					<b-button @click="startQuestionnaire(q)" variant="primary">Start / Claim Reward</b-button>
				</b-card-body>
			</b-card>
    </div>
  </section>
</template>

<script>

import { SURVEY_CONTRACT_ABI, ENS_CONTRACT_ABI, RESOLVER_CONTRACT_ABI, REGISTRAR_CONTRACT_ABI } from '~/utils/contractABI'
import config from '~/config'
import namehash from '~/utils/ensUtils'


export default {
	components: {},
	data() {
		return {
			questionnires: [],
			web3Instance: this.$store.state.web3Instance,
			currentAccount: '',
		}
	},
	async mounted() {
		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof web3 !== 'undefined') {
			// Use MetaMask's provider
			this.$store.dispatch('registerWeb3', window.web3)
			const accounts = await this.web3Instance.eth.getAccounts()

			if (accounts.length === 0) {
				alert('Please unlock metamask plugin to enter this Dapp!')
			} else {
				this.currentAccount = accounts[0]
				// Set Resolver Contract
				const ResolverContract = new this.web3Instance.eth.Contract(RESOLVER_CONTRACT_ABI, config.RESOLVER_ADDRESS_RINKEBY)
				// Use ENS Resolver to get the smart contract address
				const surveyContractAddress = await ResolverContract.methods.addr(namehash(config.ENS_NAME_RINKEBY, this.web3Instance)).call()
				// console.log(" address :", surveyContractAddress)
				const QuestionContract = new this.web3Instance.eth.Contract(SURVEY_CONTRACT_ABI, surveyContractAddress)
				this.QuestionContract = QuestionContract
				this.listQuestionnaires()
			}
		} else {
			alert('Please install Metamask extension!')
			// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
			// window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		}
	},
	methods: {
		startQuestionnaire(questionnaire) {
			this.$router.push({ path: '/questionnaireDetails/', query : { 
				questionnaire: questionnaire				
			}})
		},
		async listQuestionnaires() {
			// Get all questionnaires
			const allQuestionnaires = await this.QuestionContract.methods.getAllQuestionnaires().call()

			allQuestionnaires.forEach(async(questionnaireKey, error) => {
				
				const question = await this.QuestionContract.methods.questionnaireStruct(questionnaireKey).call()
				question.rewards = this.web3Instance.utils.fromWei(question.rewards, 'ether')
				
				const response = await this.$axios.$get(`${config.IPFS_END_POINT}/query/fetch/${question[1]}`)
				const title = response[0].title
				const temp = {questionnaireKey, title, question }

				this.questionnires.push(temp)
			})
	
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}

.title {
	font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
		'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 1 */
	display: block;
	font-weight: 300;
	font-size: 100px;
	color: #35495e;
	letter-spacing: 1px;
}

.subtitle {
	font-weight: 300;
	font-size: 42px;
	color: #526488;
	word-spacing: 5px;
	padding-bottom: 15px;
}

.paragraph-title {
	font-weight: 300;
	font-size: 20px;
	color: #35495e;
	word-spacing: 5px;
	padding: 15px 0;
}

.receipt-box {
	padding-top: 15px;
	width: 900px;
	word-break: break-all;
}

.row {
	padding: 10px;
}
</style>
